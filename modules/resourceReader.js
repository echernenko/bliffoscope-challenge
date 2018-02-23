// resources reader from the folder /resources
// with the help of resourceProcessor.js
// cooks data for sending to browser

// let's measure how fast is calculation of object
// locations
console.time('data-loaded-in');

const fs = require('fs');
const RESOURCE_DIR = './resources';
const RESOURCE_EXTENTION = '.blf';
// TODO: think about not declaring explicitly
const resourcesToProcess = ['SlimeTorpedo', 'Starship'];
// exported to template
const resourcesPixelMap = {};
// calculation of position,intersections, probabilities etc.
const resourceProcessor = require('./resourceProcessor.js');

module.exports = {
    resourcesPixelMap: resourcesPixelMap
}

// reading resources up front
fs.readdir(RESOURCE_DIR, (err, files) => {
    if (err) {
        throw err;
    }
    let processedResources = 0;
    files.forEach((file, index) => {
        // only .blf files
        if (file.indexOf(RESOURCE_EXTENTION) === -1) return;
        const resIndex = file.replace(RESOURCE_EXTENTION,'');
        // reading individual .blf files
        fs.readFile(RESOURCE_DIR + '/' + file, (error, content) => {
            if (error) {
                throw error;
            }
            let resContent = content.toString('utf8');
            // deleting leading and finalizing empty lines
            resContent = resContent.replace(/^[ ]+\n|[ ]+\n$/g,'');

            // forming objects pixel maps
            resourcesPixelMap[resIndex] = resourceProcessor.pixelMap(resContent);
            processedResources++;

            // main trigger for calculating data for the app
            // TODO - make smarter check (res number + bliffoscope screen)
            if (processedResources === resourcesToProcess.length + 1) {

                resourcesToProcess.forEach((resType) => {
                    // forming entry for template
                    resourcesPixelMap['positioned' + resType] = [];
                    resourcesPixelMap['isReal' + resType] = [];
                    // calculating data and filling into resources
                    // for FE
                    const processedResults = resourceProcessor.getBestPositions({
                        screen: resourcesPixelMap.TestData,
                        object: {
                            pixelMap: resourcesPixelMap[resType],
                            type: resType,
                            size: resourcesPixelMap[resType].length
                        }
                    });
                    processedResults.similarities.forEach((val, index) => {
                        resourcesPixelMap['positioned' + resType][index] = [];
                        val.forEach((value) => {
                            resourcesPixelMap['positioned' + resType][index].push(resourcesPixelMap[resType].map((coords) => {
                                return resourceProcessor.translateCoordinates(coords, value[0], value[1]);
                            }));
                        });
                    });
                    processedResults.chancesIsReal.forEach((val) => {
                         resourcesPixelMap['isReal' + resType].push(val);
                    });

                });

                console.timeEnd('data-loaded-in');
                console.log('everything preloaded, enjoy using bliffoscope')

            }

        });
    });
});
