GameSparks = function() {

    var appSecret;
    
    var socketUrl;
    var authToken;
    var sessionId;

    var initialised;
    var connected;
    var error;
    var closing;
    
    var initCallback;
    var messageCallback;
    var errorCallback;

    var nonceCallback;
    
    var pendingRequests = {};
    
    var webSocket;

    this.initPreview = function(options){
        options.url = "wss://preview.gamesparks.net/ws/" + options.key;
        init(options);
    }

    this.initLive = function(options){
        options.url = "wss://service.gamesparks.net/ws/" + options.key;
        init(options);
    }
    
    function init(options) {
        socketUrl = options.url;
        appSecret = options.secret;
        initCallback = options.onInit;
        messageCallback = options.onMessage;
        errorCallback = options.onError;
        nonceCallback = options.onNonce;

        
        initialised = false;
        connected = false;
        error = false;
        closing = false;
        cleanup();
        connect();
    };
    
    this.send = function(requestType, onResponse){
        this.sendWithData(requestType, {}, onResponse);
    };
    
    this.sendWithData = function(requestType, json, onResponse){
        
        if(!initialised){
            onResponse({error:"NOT_INITIALISED"});
            return;
        }
        if(requestType.indexOf('.') !== 0){
            requestType = "."+requestType;
        }
        json["@class"] = requestType;
        
        json.requestId = (new Date()).getTime();

        if(onResponse != null){
            pendingRequests[json.requestId] = onResponse;
            setTimeout(function(){
                if(pendingRequests[json.requestId]){
                    pendingRequests[json.requestId]({error:"NO_RESPONSE"});
                }
            }, 10000);
        }
        
        var requestString = JSON.stringify(json);
        console.log("WebSocket send: " + requestString);
        webSocket.send(requestString);
    };
    
    function cleanup(){
        if(webSocket != null){
            webSocket.onclose = null;
            webSocket.close();
        }
    }
    
    var keepAliveId;

    function keepAlive(){
        if(initialised && connected){
            console.log("keepAlive");
            webSocket.send(" ");
        }
        keepAliveId = setTimeout(keepAlive, 30000);
    }

    function getWebSocket(location) {
        if (window.WebSocket) {
            return new WebSocket(location);
        } else {
            return new MozWebSocket(location);
        }
    }

    function connect() {
        webSocket = getWebSocket(socketUrl);
        webSocket.onopen = onWebSocketOpen;
        webSocket.onclose = onWebSocketClose;
        webSocket.onerror = onWebSocketError;
        webSocket.onmessage = onWebSocketMessage;
    }

    function onWebSocketError() {
        console.log('WebSocket onError: Sorry, but there is some problem with your socket or the server is down');
        if(onError){
            onError();
        }
        error = true;
    }

    function onWebSocketClose(closeEvent) {
        connected = false;
        console.log('WebSocket onClose executed ');
        if (!error) {
            connect();
        }
    }

    function onWebSocketOpen(openEvent) {
        connected = true;
        console.log('WebSocket onOpen: Connected ' + openEvent);
    }

    function onWebSocketMessage(message) {
        
        var messageData = message.data;
        
        console.log('WebSocket onMessage: ' + messageData);
        
        var result;
        
        try {
            result = JSON.parse(messageData);
        } catch (e) {
            console.log("An error ocurred while parsing the JSON Data: "
                    + message + "; Error: " + e);
            return;
        }

        if (result['authToken']) {
            authToken = result['authToken'];
            delete result['authToken'];
        }

        var resultType = result['@class'];

        if (resultType == ".AuthenticatedConnectResponse") {
            handshake(result);
        } else if (resultType.match(/Response$/)){
            if(result["requestId"]){
                var requestId = result["requestId"];
                delete result["requestId"];
                if(pendingRequests[requestId]){
                    pendingRequests[requestId](result);
                    pendingRequests[requestId] = null;
                };
            };
        } else {
            messageCallback(result);
        };

    }
    
    function handshake(result){
        
        if (result['connectUrl']) {
            socketUrl = result['connectUrl'];
            return;
        } else if (result['nonce']) {
            
            var hmac;

            if(nonceCallback != null){
                hmac = nonceCallback(result['nonce']);
            } else {
                hmac = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(result['nonce'], appSecret));
            }

            var toSend = {
                "@class" : ".AuthenticatedConnectRequest",
                hmac : hmac
            };

            if (authToken) {
                toSend.authToken = authToken;
            }

            if (sessionId) {
                toSend.sessionId = sessionId;
            }

            toSend.platform = BrowserDetect.browser;
            toSend.os = BrowserDetect.OS;
            webSocket.send(JSON.stringify(toSend));
            return;
        } else if (result['sessionId']) {
            sessionId = result['sessionId'];
            initialised = true;
            if(initCallback){
                initCallback();
            }
            keepAliveId = setTimeout(keepAlive, 30000);
            return;
        }
    }

    this.getAuthToken = function(){
        return authToken;
    }

    this.setAuthToken = function(givenAuthToken){
        authToken = givenAuthToken;
    }
};



var BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
        },
        searchString: function (data) {
            for (var i=0;i<data.length;i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            {   string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {       // for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            {       // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS : [
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                   string: navigator.userAgent,
                   subString: "iPhone",
                   identity: "iPhone/iPod"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]

    };
    BrowserDetect.init();

GameSparks.prototype.acceptChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("AcceptChallengeRequest", request, onResponse);
}
GameSparks.prototype.accountDetailsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("AccountDetailsRequest", request, onResponse);
}
GameSparks.prototype.analyticsRequest = function(data, end, key, start, onResponse )
{
    var request = {};
        request["data"] = data;
        request["end"] = end;
        request["key"] = key;
        request["start"] = start;
    this.sendWithData("AnalyticsRequest", request, onResponse);
}
GameSparks.prototype.aroundMeLeaderboardRequest = function(count, friendIds, leaderboardShortCode, social, onResponse )
{
    var request = {};
        request["count"] = count;
        request["friendIds"] = friendIds;
        request["leaderboardShortCode"] = leaderboardShortCode;
        request["social"] = social;
    this.sendWithData("AroundMeLeaderboardRequest", request, onResponse);
}
GameSparks.prototype.authenticationRequest = function(password, userName, onResponse )
{
    var request = {};
        request["password"] = password;
        request["userName"] = userName;
    this.sendWithData("AuthenticationRequest", request, onResponse);
}
GameSparks.prototype.buyVirtualGoodsRequest = function(currencyType, quantity, shortCode, onResponse )
{
    var request = {};
        request["currencyType"] = currencyType;
        request["quantity"] = quantity;
        request["shortCode"] = shortCode;
    this.sendWithData("BuyVirtualGoodsRequest", request, onResponse);
}
GameSparks.prototype.changeUserDetailsRequest = function(displayName, onResponse )
{
    var request = {};
        request["displayName"] = displayName;
    this.sendWithData("ChangeUserDetailsRequest", request, onResponse);
}
GameSparks.prototype.chatOnChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("ChatOnChallengeRequest", request, onResponse);
}
GameSparks.prototype.consumeVirtualGoodRequest = function(quantity, shortCode, onResponse )
{
    var request = {};
        request["quantity"] = quantity;
        request["shortCode"] = shortCode;
    this.sendWithData("ConsumeVirtualGoodRequest", request, onResponse);
}
GameSparks.prototype.createChallengeRequest = function(accessType, challengeMessage, challengeShortCode, currency1Wager, currency2Wager, currency3Wager, currency4Wager, currency5Wager, currency6Wager, endTime, expiryTime, maxAttempts, maxPlayers, minPlayers, silent, startTime, usersToChallenge, onResponse )
{
    var request = {};
        request["accessType"] = accessType;
        request["challengeMessage"] = challengeMessage;
        request["challengeShortCode"] = challengeShortCode;
        request["currency1Wager"] = currency1Wager;
        request["currency2Wager"] = currency2Wager;
        request["currency3Wager"] = currency3Wager;
        request["currency4Wager"] = currency4Wager;
        request["currency5Wager"] = currency5Wager;
        request["currency6Wager"] = currency6Wager;
        request["endTime"] = endTime;
        request["expiryTime"] = expiryTime;
        request["maxAttempts"] = maxAttempts;
        request["maxPlayers"] = maxPlayers;
        request["minPlayers"] = minPlayers;
        request["silent"] = silent;
        request["startTime"] = startTime;
        request["usersToChallenge"] = usersToChallenge;
    this.sendWithData("CreateChallengeRequest", request, onResponse);
}
GameSparks.prototype.declineChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("DeclineChallengeRequest", request, onResponse);
}
GameSparks.prototype.deviceAuthenticationRequest = function(deviceId, deviceModel, deviceName, deviceOS, deviceType, operatingSystem, onResponse )
{
    var request = {};
        request["deviceId"] = deviceId;
        request["deviceModel"] = deviceModel;
        request["deviceName"] = deviceName;
        request["deviceOS"] = deviceOS;
        request["deviceType"] = deviceType;
        request["operatingSystem"] = operatingSystem;
    this.sendWithData("DeviceAuthenticationRequest", request, onResponse);
}
GameSparks.prototype.dismissMessageRequest = function(messageId, onResponse )
{
    var request = {};
        request["messageId"] = messageId;
    this.sendWithData("DismissMessageRequest", request, onResponse);
}
GameSparks.prototype.endSessionRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("EndSessionRequest", request, onResponse);
}
GameSparks.prototype.facebookConnectRequest = function(accessToken, code, onResponse )
{
    var request = {};
        request["accessToken"] = accessToken;
        request["code"] = code;
    this.sendWithData("FacebookConnectRequest", request, onResponse);
}
GameSparks.prototype.findChallengeRequest = function(accessType, count, offset, onResponse )
{
    var request = {};
        request["accessType"] = accessType;
        request["count"] = count;
        request["offset"] = offset;
    this.sendWithData("FindChallengeRequest", request, onResponse);
}
GameSparks.prototype.getChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("GetChallengeRequest", request, onResponse);
}
GameSparks.prototype.getDownloadableRequest = function(shortCode, onResponse )
{
    var request = {};
        request["shortCode"] = shortCode;
    this.sendWithData("GetDownloadableRequest", request, onResponse);
}
GameSparks.prototype.getMessageRequest = function(messageId, onResponse )
{
    var request = {};
        request["messageId"] = messageId;
    this.sendWithData("GetMessageRequest", request, onResponse);
}
GameSparks.prototype.getRunningTotalsRequest = function(friendIds, shortCode, onResponse )
{
    var request = {};
        request["friendIds"] = friendIds;
        request["shortCode"] = shortCode;
    this.sendWithData("GetRunningTotalsRequest", request, onResponse);
}
GameSparks.prototype.getUploadUrlRequest = function(uploadData, onResponse )
{
    var request = {};
        request["uploadData"] = uploadData;
    this.sendWithData("GetUploadUrlRequest", request, onResponse);
}
GameSparks.prototype.getUploadedRequest = function(uploadId, onResponse )
{
    var request = {};
        request["uploadId"] = uploadId;
    this.sendWithData("GetUploadedRequest", request, onResponse);
}
GameSparks.prototype.googlePlayBuyGoodsRequest = function(currencyCode, signature, signedData, subUnitPrice, onResponse )
{
    var request = {};
        request["currencyCode"] = currencyCode;
        request["signature"] = signature;
        request["signedData"] = signedData;
        request["subUnitPrice"] = subUnitPrice;
    this.sendWithData("GooglePlayBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.iOSBuyGoodsRequest = function(currencyCode, receipt, sandbox, subUnitPrice, onResponse )
{
    var request = {};
        request["currencyCode"] = currencyCode;
        request["receipt"] = receipt;
        request["sandbox"] = sandbox;
        request["subUnitPrice"] = subUnitPrice;
    this.sendWithData("IOSBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.joinChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("JoinChallengeRequest", request, onResponse);
}
GameSparks.prototype.leaderboardDataRequest = function(challengeInstanceId, entryCount, friendIds, leaderboardShortCode, offset, social, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["entryCount"] = entryCount;
        request["friendIds"] = friendIds;
        request["leaderboardShortCode"] = leaderboardShortCode;
        request["offset"] = offset;
        request["social"] = social;
    this.sendWithData("LeaderboardDataRequest", request, onResponse);
}
GameSparks.prototype.listAchievementsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListAchievementsRequest", request, onResponse);
}
GameSparks.prototype.listChallengeRequest = function(entryCount, offset, shortCode, state, onResponse )
{
    var request = {};
        request["entryCount"] = entryCount;
        request["offset"] = offset;
        request["shortCode"] = shortCode;
        request["state"] = state;
    this.sendWithData("ListChallengeRequest", request, onResponse);
}
GameSparks.prototype.listChallengeTypeRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListChallengeTypeRequest", request, onResponse);
}
GameSparks.prototype.listGameFriendsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListGameFriendsRequest", request, onResponse);
}
GameSparks.prototype.listInviteFriendsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListInviteFriendsRequest", request, onResponse);
}
GameSparks.prototype.listLeaderboardsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListLeaderboardsRequest", request, onResponse);
}
GameSparks.prototype.listMessageRequest = function(entryCount, offset, onResponse )
{
    var request = {};
        request["entryCount"] = entryCount;
        request["offset"] = offset;
    this.sendWithData("ListMessageRequest", request, onResponse);
}
GameSparks.prototype.listMessageSummaryRequest = function(entryCount, offset, onResponse )
{
    var request = {};
        request["entryCount"] = entryCount;
        request["offset"] = offset;
    this.sendWithData("ListMessageSummaryRequest", request, onResponse);
}
GameSparks.prototype.listVirtualGoodsRequest = function(onResponse )
{
    var request = {};
    this.sendWithData("ListVirtualGoodsRequest", request, onResponse);
}
GameSparks.prototype.logChallengeEventRequest = function(challengeInstanceId, eventKey, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["eventKey"] = eventKey;
    this.sendWithData("LogChallengeEventRequest", request, onResponse);
}
GameSparks.prototype.logEventRequest = function(eventKey, onResponse )
{
    var request = {};
        request["eventKey"] = eventKey;
    this.sendWithData("LogEventRequest", request, onResponse);
}
GameSparks.prototype.pushRegistrationRequest = function(deviceOS, pushId, onResponse )
{
    var request = {};
        request["deviceOS"] = deviceOS;
        request["pushId"] = pushId;
    this.sendWithData("PushRegistrationRequest", request, onResponse);
}
GameSparks.prototype.registrationRequest = function(displayName, password, userName, onResponse )
{
    var request = {};
        request["displayName"] = displayName;
        request["password"] = password;
        request["userName"] = userName;
    this.sendWithData("RegistrationRequest", request, onResponse);
}
GameSparks.prototype.sendFriendMessageRequest = function(friendIds, message, onResponse )
{
    var request = {};
        request["friendIds"] = friendIds;
        request["message"] = message;
    this.sendWithData("SendFriendMessageRequest", request, onResponse);
}
GameSparks.prototype.socialLeaderboardDataRequest = function(challengeInstanceId, entryCount, friendIds, leaderboardShortCode, offset, social, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["entryCount"] = entryCount;
        request["friendIds"] = friendIds;
        request["leaderboardShortCode"] = leaderboardShortCode;
        request["offset"] = offset;
        request["social"] = social;
    this.sendWithData("SocialLeaderboardDataRequest", request, onResponse);
}
GameSparks.prototype.twitterConnectRequest = function(accessSecret, accessToken, onResponse )
{
    var request = {};
        request["accessSecret"] = accessSecret;
        request["accessToken"] = accessToken;
    this.sendWithData("TwitterConnectRequest", request, onResponse);
}
GameSparks.prototype.windowsBuyGoodsRequest = function(currencyCode, receipt, subUnitPrice, onResponse )
{
    var request = {};
        request["currencyCode"] = currencyCode;
        request["receipt"] = receipt;
        request["subUnitPrice"] = subUnitPrice;
    this.sendWithData("WindowsBuyGoodsRequest", request, onResponse);
}
GameSparks.prototype.withdrawChallengeRequest = function(challengeInstanceId, message, onResponse )
{
    var request = {};
        request["challengeInstanceId"] = challengeInstanceId;
        request["message"] = message;
    this.sendWithData("WithdrawChallengeRequest", request, onResponse);
}
GameSparks.prototype.aroundMeLeaderboardRequest = function(leaderboardShortCode, onResponse)
{
    var request = {};
        request["leaderboardShortCode"] = leaderboardShortCode;
        request["count"] = 1;
        request["social"] = false;
    this.sendWithData("AroundMeLeaderboardRequest", request, onResponse);
}

GameSparks.prototype.logLogoPointsRequest = function(points, onResponse)
{
    var request = {};
        request["eventKey"] = 'LOGO_GUESS';
        request["POINTS"] = points;
    this.sendWithData("LogEventRequest", request, onResponse);
};

GameSparks.prototype.logTriviaPointsRequest = function(points, onResponse)
{
    var request = {};
        request["eventKey"] = 'TRIVIA_GUESS';
        request["POINTS"] = points;
    this.sendWithData("LogEventRequest", request, onResponse);
};