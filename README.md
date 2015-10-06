# A Virtual Device Wall for testing Ionic/Cordova

A simple command line tool to create a virtual device wall to test your Cordova app across multiple devices. The Virtual Wall also lets your synchronize clicks, scrolls and other gestures across the devices on the wall. 

The virtual wall is powerd by [Appetize](https://appetize.io/) and [Browser-sync](http://www.browsersync.io/). 

## Usage

0. Get an API token from Appetize using https://appetize.io/api. 
1. Navigate to the root directory for your Cordova or Ionic App. You need to have the `cordova` command in your path. 
2. Install the tool using `npm install virtual-device-wall`
3. Run `node_modules/.bin/wall --appetize=APPETIZE_KEY`. 
4. Open the URL displayed on a large screen (preferably a television or a projector !!). 

## How it works

The Virtual Device Wall is a web page with devices embedded using Appetize. Once your app is built and an __apk__ and __ipa__ is available, it uploads these to the Appetize servers. 
I then starts up a local server uses `localtunnel.me` to expose that server to the internet. The apps serve their content using this server. Browser-sync is responsible for mirroring clicks, scrolls and other gestures across the various devices. You can also install the app on a local device and use that as a remote control for driving the devices on the virtual wall.  

