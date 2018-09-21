# Changelog

This changelog contains the changes for Ice-Spear and all sub modules. <br/>
The current released and prebuilt stable version is: **2.1.0**

<hr/>

### Version 2.2.0 - "Convenience Update"

**Field + Shrine Editor** <br/>
#53 - added history, use the controls at the top or CTRL+Z / CTRL+Y to undo/redo changes <br/>
#36 - actor-tools: the actor type (Dynamic/Static) can now be changed <br/>
#36 - actor tools: added focus button that positions the camera near the actor and looks at it <br/>
#36 - actor tools: added de-select button <br/>
#36 - actors can now be selected with right and/or middle click (see global settings) <br/>
#36 - added a button in the launcher to open the Wiki <br/>

**Mubin-Logic Viewer** <br/>
#dev - added very experimental mubin-logic viewer, right now it only views data

<hr/>

### Version 2.1.0 - "Field-Editor + Map"

**Map-Viewer**<br/>
#48 - map viewer (in the launcher, click on the shrines/overworld icon), can be used to open field-sections and shrines<br/>

**Field-Editor** <br/>
#45 - automatically extracts static actors files from the TitleBG.pack <br/>
#45 - can now save static actors (and re-pack the TitleBG) <br/>
#49 - added global setting to disable map-model loading <br/>
#50 - added render setting to show/hide "_Far" LOD models <br/>

**Bugfixes**<br/>
#dev - fixed issue with electron build that would throw an error while reading textures <br/>
#dev - fixed texture bug that would crash the app while loading unknown texture formats <br/>
#dev - fixed model-parser bug for empty BFRES files that would result in an infinite loop (@ice-spear, @binary-file) <br/>

<hr/>

### Version 2.0.0 - "Field-Editor Beta"
**Bugfixes** <br/>
#37 - fixed Actor duplication bug, byaml array-data is now correct (@byaml-lib)<br/>
#37 - fixed invalid SARC creation bug, file-table was sorted wrong (@sarc-lib)<br/>

**Shrine-Editor** <br/>
#38 - PrOD files are now loaded

**Field-Editor** <br/>
#38 - first version of the editor, can load mubin/PrOD files<br/>
#38 - can save mubin files<br/>
#40 - can load the actual map-mesh + water dynamically<br/>
#40 - terrain textures are cached now<br/>
#43 - automat. sets the FPS to 30, uses the accurate timer, and speeds up the camera

**Model-Editor** <br/>
#40 - array-textures can now be displayed and exported as PNG, a selectbox was added to select the index

**Settings**<br/>
#40 - added cache settings to enable/disable the terrain and actor cache <br/>
#40 - added clear-cache function + info how big the cache is

**Misc**<br/>
#40 - rewritten renderer, performance is now waaaay better<br/>
#43 - FPS can now be manually set to anything you want, by default 60<br/>
#43 - a better frame time can be set in the render-settings -> more stable FPS, higher CPU usage <br/>
#43 - Camera speed is now independent from the FPS<br/>
#38 - sub-models now also search for textures with a base name (.1.bfres files are still not checked however)<br/>
#40 - bfres materials are now assigned using the correct index (e.g. trees now have correct textures)<br/>
#40 - tuned down the SAO effect to make the field-editor look good<br/>
#40 - any FTEX instance now uses a global (RAM-only) cache for textures -> less RAM, shorter loading times<br/>
#40 - FTEX parser now only creates color-channels it needs, and even removes unused alpha-channels -> less RAM usage, smaller cache <br/>
#40 - general array-texture support<br/>
#40 - actors (shrine/field) are now cached -> 8-10 times faster loading times, but creates GBs of cache files <br/>

<hr/>

### Version 1.0.0 - "Shrine-Editor"
First release!