# Changelog

This changelog contains the changes for Ice-Spear and all sub modules. <br/>
The current released and prebuild version is: **1.0.0**

<hr/>

### Version 1.1.0 - "Field-Editor" (WIP)
**Shrine-Editor** <br/>
#37 - fixed Actor dublication, byaml array-data is now correct (@byaml-lib)<br/>
#38 - PrOD files are now loaded

**Field-Editor** <br/>
#38 - first version of the editor, can load mubin/PrOD files<br/>
#38 - can save mubin files<br/>
#40 - can load the actual map-mesh + water dynamically<br/>
#40 - terrain textures are cached now<br/>

**Model-Editor** <br/>
#40 - array-textures can now be displayed and exported as PNG, a selectbox was added to select the index

**Settings**<br/>
#40 - added cache settings to enable/disable the terrain and actor cache

**Misc**<br/>
#38 - sub-models now also search for textures with a base name (.1.bfres files are still not checked however)<br/>
#40 - bfres materials are now assigned using the correct index (e.g. trees now have correct textures)<br/>
#40 - tuned down the SAO effect to make the field-editor look good<br/>
#40 - any FTEX instance now uses a global (RAM-only) cache for textures -> less RAM, shorter loading times<br/>
#40 - general array-texture support<br/>
#40 - actors (shrine/field) are now cached -> 8-10 times faster loading times, creates GBs of cache files <br/>

<hr/>

### Version 1.0.0 - "Shrine-Editor"
First release!