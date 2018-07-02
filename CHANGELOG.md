# Changelog

This changelog contains the changes for Ice-Spear and all sub modules. <br/>
The current released and prebuild version is: **1.0.0**

<hr/>

### Version 1.1.0 (WIP)
**Shrine-Editor** <br/>
#37 - fixed Actor dublication, byaml array-data is now correct (@byaml-lib)<br/>
#38 - PrOD files are now loaded

**Field-Editor** <br/>
#38 - first version of the editor, can load mubin/PrOD files
#38 - can save mubin files
#40 - can load the actual map-mesh (tiles) dynamically
#40 - added a global setting to cache terrain textures (default: on)

**Model-Editor** <br/>
#40 - array-textures can now be displayed and exported as PNG, a selectbox was added to select the index

**Misc**<br/>
#38 - sub-models now also search for textures with a base name (.1.bfres files are still not checked however)
#40 - bfres materials are now assigned using the correct index (e.g. trees now have correct textures)
#40 - tuned down the SAO effect to make the field-editor look good
#40 - any FTEX instance now uses a global cache for textures -> less RAM, shorter loading times
#40 - general array-texture support

<hr/>

### Version 1.0.0
First release!