module.exports = {
    pixelMap: pixelMap,
    translateCoordinates: translateCoordinates,
    getBestPositions: getBestPositions
}

// cached bliffoscope pixel map
// for faster lookups
const bliffoscopePixelMap = {};

// object sizes (bliffoscope, torpedo, starship)
// calculated only once
const objectSizes = {};

// mapper of resource files to
// array of coordinates
// (array of 2 dimentional arrays)
function pixelMap (charMap) {
    var x = 0;
    var y = 0;
    var char = '';
    var map = [];
    for (var i = 0; i < charMap.length; i++) {
        char = charMap[i];
        if (char == '+') {
            map.push([x, y])
        }
        x += 1;
        if (char == '\n') {
            x = 0;
            y += 1;
        }
    }
    return map;
}

// array intersection between bliffoscope screen and
// translated object
function arrayIntersect (bliffoscopeScreen, translatedObject) {

    // populating bliffoscopePixelMap if it's
    // empty (one time operation)
    if (Object.keys(bliffoscopePixelMap).length === 0) {
        for (let i = 0; i < bliffoscopeScreen.length; i++) {
            const key = bliffoscopeScreen[i];
            bliffoscopePixelMap[key] = 1;
        }
    }

    var intersectionCoordArray = [];
    var tempHash = {};

    // first marking translatedObject coordinates
    // as "1" in hash map for lookup
    for (let i = 0; i < translatedObject.length; i++) {
        const key = translatedObject[i];
        if (bliffoscopePixelMap[key]) {
            intersectionCoordArray.push(key);
        }
    }

    return intersectionCoordArray;
}

// helper function to move object on bliffoscope
// screen
function translateCoordinates (coords, ix, iy) {
    return [coords[0] + ix, coords[1] + iy];
}

// getting coordinates, where object is likely
// situated on bliffoscope screen
function getBestPositions (config) {

    const screen = config.screen;
    const object = config.object.pixelMap;
    const objectPixelsNum = config.object.size;
    const objectType = config.object.type;
    let chancesIsReal = [];

    // calculating object sizes if unknown
    // only once
    if (!objectSizes.screen){
        objectSizes.screen = {
            width: screen.sort(function(a, b) {
                       return b[0] - a[0];
                   })[0][0],
            height: screen.sort(function(a, b) {
                       return b[1] - a[1];
                   })[0][1]
        }
    }
    // same caching for new type of object
    if (!objectSizes[objectType]){
    objectSizes[objectType] = {
        width: object.sort(function(a, b) {
                   return b[0] - a[0];
               })[0][0],
        height: object.sort(function(a, b) {
                   return b[1] - a[1];
               })[0][1]
        }
    }

    // mostly static querying
    screenWidth = objectSizes.screen.width;
    screenHeight = objectSizes.screen.height;
    objectWidth = objectSizes[objectType].width;
    objectHeight = objectSizes[objectType].height;

    // getting similarities
    let similarities = [];
    for (let cx = 0; cx <= screenWidth - objectWidth; cx++) {
        for (let cy = 0; cy <= screenHeight - objectHeight; cy++) {
            const translatedObject = object.map(function(coords) {
                return translateCoordinates(coords, cx, cy);
            });
            const intersection = arrayIntersect(screen, translatedObject);
            const chancePercentage = parseFloat((intersection.length / objectPixelsNum) * 100).toFixed(2);
            // similarities exists across whole screen
            // it can be array of similarities with the same chance
            // is real
            // making sure we have array to push to
            const resKey = intersection.length;
            if (!Array.isArray(similarities[resKey])){
                similarities[resKey] = [];
            }
            const translatedObjectCoord = [cx, cy];
            similarities[resKey].push(translatedObjectCoord);
            chancesIsReal[resKey] = chancePercentage;
        }
    }

    // making sure we have all elements of the arrays filled in
    similarities = similarities.filter((n) => { return Array.isArray(n); });
    chancesIsReal = chancesIsReal.filter((n) => { return n !== undefined; });

    const output = {
        similarities: similarities,
        chancesIsReal: chancesIsReal
    };

    return output;
}
