# Flickr Explorer

With this simple javascript app you can search for photos on Flickr and have infinite scroll listing of the resulting search result. Just type some keyword for the photos that you are looking for in the above search bar and the result will appear here. You can then click on each thumbnail and see the large version of the photos (if it's available by Flickr) and alos some details about that photo.

## Demo
https://emkamal.github.io/flickr-explorer/

## Dev
To setup the script on your own machine, clone the repo and then install all the dependencies by using this command on the console:
`npm install`
This will install all the required package, it will take a few minutes so relax and have a cup of coffee while waiting :). After it's done, execute this command:
`npm start`
It will then run the app in the development mode. Open http://localhost:3000 to view it in the browser.

## Build
The build system uses Webpack. It will generate the build folder containing all the optimized and bundled script to be used in production. Builds the app for production to the build folder. Everything would be minified and the filenames include the hashes. It will then ready to be deployed. To build it, use this command
`npm run build`

## Toolchain
* **Javascript ES6**. The language of choice.
* **React**. The modern and popular Javascript framework. Why do I choose this for this particular simple app? No definitive reason, I just want to get my hands dirty on this so-called framework. I have never really play around it deeply before so I figure out that this would be a good chance to learn this framework on the way.
- **ReactDOM**. To be used alongside react to manipulate dom.
- **React Script**. Provide the npm install, start, test and build command. 
- **React Infinite Scroller**. Provide infinite scroll loading functionality.
- **Webpack**. The arguably most modern javascript build system. Itäs included in the react script.
- **Babel**. So that our cool future-friendly app works well with lame browsers ;)
- **Qwest**. Modern ajax library to make connection to Flickr API.