/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Raytracer
{
    /**
     * @param {Function} selectedCallback callback for selected actors
     */
    constructor(selectedCallback)
    {
        this.selectedCallback = selectedCallback;
    }

    /**
     * raytraces all objects pass into, 
     * and calls the callback function if anything was hit
     * @param {Object} raycaster 
     * @param {Array} castObjects object array to raycast
     * @param {bool} isMouseUp is the mouse button released
     * @param {bool} mouseMoved has the mouse moved while holding the mouse button
     */
    raytrace(raycaster, castObjects, isMouseUp, mouseMoved)
    {
         console.time("raycast");

         let currentDistance = Infinity;
         const hitInstances = [];

         const orgRay = new THREE.Ray();
         orgRay.copy(raycaster.ray);

         for(let obj of castObjects)
         {
             if(obj.userData.type == "actor" && obj.userData.actorObject)
             {
                 const actorObj = obj.userData.actorObject;
                 for(let entry of actorObj.instances)
                 {
                     const instance = entry[1];
                     let inverseMatrix = new THREE.Matrix4();
                     inverseMatrix.getInverse(instance.matrix);

                     raycaster.ray.copy(orgRay).applyMatrix4(inverseMatrix);
                     //raycaster.ray.origin.y *= -1.0;
                     //raycaster.ray.direction.y *= -1.0;

                     const intersects = raycaster.intersectObject(obj, true);


                     if(intersects.length > 0)
                     {
                        console.log(raycaster.ray.origin);
                        console.log(raycaster.ray.direction);
                        console.log(intersects); 
                        console.log(instance); 
                     }

                     if(intersects.length > 0 && intersects[0].distance < currentDistance)
                     {
                        currentDistance = intersects[0].distance;
                        hitInstances[0] = instance;
                     }
                 }
             }
         }

         console.timeEnd("raycast");

         if(isMouseUp || hitInstances.length > 0)
         {
             this.selectedCallback(hitInstances, isMouseUp, mouseMoved);
         }
    }
}
