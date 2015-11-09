# A Virtual Device Wall for testing Ionic/Cordova

A simple command line tool to create a virtual device wall to test your Cordova app across multiple devices. The Virtual Wall also lets your synchronize clicks, scrolls and other gestures across the devices on the wall. 

> On npm: [Virtual-device-wall](http://npmjs.com/package/virtual-device-wall)

[Blog post](http://blog.nparashuram.com/2015/11/virtual-device-wall-for-cordova-apps.html) explaning the idea. 

## Demo

[![Virtual Device Wall - Youtube Video Link ](http://img.youtube.com/vi/lK4wSxDy0h4/0.jpg)](http://www.youtube.com/watch?v=lK4wSxDy0h4)

## Usage

0. Get an API token from Appetize using https://appetize.io/api. 
1. Navigate to the root directory for your Cordova or Ionic App. You need to have the `cordova` command in your path. 
2. Install the tool using `npm install virtual-device-wall`
3. Run `node_modules/.bin/wall --appetize=APPETIZE_KEY`. 
4. Open the URL displayed on a browser (preferably on a large screen like television or a projector !!). 
5. Interact with one device and gestures are mirrored on all other devices. 
 If you had a device connected, you can use that device as a remote for mirroring gestures on your device wall. 

## How it works

The Virtual Device Wall is a web page with devices embedded using Appetize. Once your app is built and an __apk__ and __ipa__ is available, it uploads these to the Appetize servers. 
It then starts up a local server uses `ngrok` to expose that server to the internet. The apps serve their content using this server. Browser-sync is responsible for mirroring clicks, scrolls and other gestures across the various devices. You can also install the app on a local device and use that as a remote control for driving the devices on the virtual wall.  

The virtual wall is powerd by [Ngrok](https://ngrok.com/), [Appetize](https://appetize.io/) and [Browser-sync](http://www.browsersync.io/). 

