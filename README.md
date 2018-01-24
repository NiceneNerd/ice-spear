#  Ice-Spear - a Breath of the Wild Editor
![alt Ice-Spear](assets/img/logo_128.png)

### Installation
____
Note: This program requires [Node.js](https://nodejs.org/) v8+ to run.  
After checking out the source files, you first need to install all dependencies:

```sh
$ npm install
```

You may also want to run this command if you checkout a newer version.
  
<br />
### Usage
____

To start the program use the following command:
```sh
$ npm start
```
<br />
If you want to start a specific App/Editor, you can pass the name as the first parameter:
```sh
$ npm start [name]
```
The Apps are located inside the app directory, every directory name inside can be used for [name]

<br />
### Troubleshooting
____

##### Yaz0 / PNG export isn't working
While installing, the script is also rebuilding some native Node C++ libraries for the current electron version.  
If for whatever reason you can't complie them on your system, the following tools won't work:
- unpacking of "Yaz0" files
- PNG export of textures

To manually rebuild native libraries run:
```sh
$ npm run postinstall
```

<br />
### License
___
Licensed under GNU GPLv3.  
For more information see the LICENSE file in the project's root directory