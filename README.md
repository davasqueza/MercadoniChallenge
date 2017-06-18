# Mercadoni Challenge

The Mercadoni Challenge is a small exercise to asses the way you build, document and
test software.

## Install

 - Install NodeJS, the project MercadoniChallenge require Node.js v6+ in order to works, download from [here](https://nodejs.org/es/download/)
 - Install required tools: `gulp` and `bower`
    ```sh
    $ npm install -g gulp bower
    ```
 - Go to the project folder and install `bower` and `npm` dependencies 
    ```sh
    $ cd MercadoniChallenge
    $ npm install
    $ bower install
    ```
    
## Development workflow
 

| Task | description |
| ------ | ------ |
| serve | Used on development phase, the command `gulp serve` start a local server with support with live reload|
| inject | The command `gulp inject` inject the dependencies declared on bower.json |
| build | The command `gulp build` builds the project and generate the production version, the final result is allocated on the folder `/dist` |
| serve:dist | The command `gulp serve:dist` start a local server from the production version of the application |

