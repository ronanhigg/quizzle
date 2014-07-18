# To Do

## Quizzle Webapp

* ~~Test for and fix recurring stream timeout error. “There was a connection problem and no quizzes could be retrieved”…”BLTimeoutError. The Business Logic script did not complete”…”The script was terminated due to timing constraints; took more than 2000ms to complete.  Did you forget to call response.complete() or resonse.contue()?”~~
* ~~Fix problem that only Adverts.ie ad is showing in quiz stream~~
    * Adverts.ie was the only Advertiser with any trivia questions who were running ads when this was noted
* ~~Standardise the size of white background for brand icons (icons without white background should get one)~~
* ~~Add a thin 3-minute time countdown progress bar for each quiz unit  (see original UI designs).  Don’t disable quiz unit at end of 3-minutes just yet.  Want to just illustrate how many quiz questions will be unexpired.~~
* Introduce game features such as
    * ~~Points accumulator~~
    * ~~User profiles~~
    * ~~User Registration/Social Login~~
    * Achievements
    * ~~Rewards catalogue~~
    * ~~Rewards claiming~~
    * Perhaps use GameSparks or other game framework
    * Sounds and Animations polish
* ~~Change top left icon to trigger Main panel menu (see TVsmiles app as reference.  Images included here inline)~~
* ~~Include refresh button in Main panel menu (refresh button is not available in Web app view mode on iOS)~~
* ~~Change top right icon to trigger Rewards Catalogue panel menu (see TVsmiles app as reference)~~
* Lazy load previous quiz units as stream approaches bottom of page (currently requires manual “Load More”)
* ~~New storyboard image size to be handled~~

## Operator Dashboard

* Enable sorting of columns in http://operator.secondscreenmedia.net/ads (currently sorting by Kinvey ID) 
* Search/Filter for a specific ad?
* ~~"Enter New Ad" form loses information already entered, if there is an upload/submit error~~
    * Cannot recreate this issue as described. However: if an existing Advertiser Logo is changed and the Ad Storyboard is missing from the form, then the new Logo is not uploaded and redisplayed to the user.

## Older Entries

* Add link to Advertiser page from Ad once an existing Advertiser has been selected
* Fix up Advertisers page with ordering, pagination, no of quizzes