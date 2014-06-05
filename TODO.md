# To Do

## Quizzle Webapp

* Add apple-touch-icon for iOS web app desktop icon (and Android web app bookmark)
* Test for and fix recurring stream timeout error. “There was a connection problem and no quizzes could be retrieved”…”BLTimeoutError. The Business Logic script did not complete”…”The script was terminated due to timing constraints; took more than 2000ms to complete.  Did you forget to call response.complete() or resonse.contue()?”
* Fix problem that only Adverts.ie ad is showing in quiz stream
* Standardise the size of white background for brand icons (icons without white background should get one)
* Add a thin 3-minute time countdown progress bar for each quiz unit  (see original UI designs).  Don’t disable quiz unit at end of 3-minutes just yet.  Want to just illustrate how many quiz questions will be unexpired.
* Introduce game features such as
    * Points accumulator
    * User profiles
    * User Registration/Social Login
    * Achievements
    * Rewards catalogue
    * Rewards claiming
    * Perhaps use GameSparks or other game framework
    * Sounds and Animations polish
* Change top left icon to trigger Main panel menu (see TVsmiles app as reference.  Images included here inline)
* Include refresh button in Main panel menu (refresh button is not available in Web app view mode on iOS)
* Change top right icon to trigger Rewards Catalogue panel menu (see TVsmiles app as reference)
* Simplify the quiz units' timestamps to Twitter-style: 2s, 3m, 1h, 3d
* Lazy load previous quiz units as stream approaches bottom of page (currently requires manual “Load More”)

## Operator Dashboard

* Enable sorting of columns in http://operator.secondscreenmedia.net/ads (currently sorting by Kinvey ID) 
* Search/Filter for a specific ad?
* "Enter New Ad" form loses information already entered, if there is an upload/submit error http://operator.secondscreenmedia.net/ads/create

## Older Entries

* Add link to Advertiser page from Ad once an existing Advertiser has been selected
* Fix up Advertisers page with ordering, pagination, no of quizzes