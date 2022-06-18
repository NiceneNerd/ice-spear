#  Ice-Spear - a Breath of the Wild Editor
![alt Ice-Spear](assets/icons/icon_256_thin.png)

For any information on how to use this, please see the Wiki: <br/>
https://gitlab.com/ice-spear-tools/ice-spear/wikis/home

Issues for bugs and features are inside the issue-repo: <br/>
https://gitlab.com/ice-spear-tools/issue-tracker/issues

### Building

- **Windows**
  - Install the latest [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases)
  - Open cmd as admin and `run nvm install 14.19.3`
  - Then run `nvm use 14.19.3`
  - Next, either open a new CMD in the location you wish to clone Ice-Spear to, or cd to that location.
  - To clone Ice-spear (if you haven't already) run `git clone https://github.com/NiceneNerd/ice-spear.git -b beta` (in the folder above the root build folder, git will create the root folder named ice-spear). This step requires git to be installed.
  - Next run `yarn`, if errors occur in relation to gyp, follow [this stack overflow answer](https://stackoverflow.com/a/71523704) to fix it and run `yarn` once more.

### License
___
Licensed under GNU GPLv3.  
For more information see the LICENSE file in the project's root directory
