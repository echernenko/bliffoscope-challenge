;(function(){

    // using canvas as good proxy for screen
    var canvas = document.getElementById('bliffoscope-screen');
    var ctx = canvas.getContext('2d');
    var scale = 7;

    // slider for accuracy listener
    var slider = document.getElementById('slider-range');
    var sliderValue = document.getElementById('slider-value');
    var debounceId;
    slider.addEventListener('input', function(){
        if (debounceId) clearTimeout(debounceId);
        var me = this;
        debounceId = setTimeout(function(){
            sliderValue.innerHTML = me.value;
            renderBliffoscopeScreen(me.value);
        }, 250);
    });

    // application logic

    // parsing pixel map of test data
    var pixelMapTestData = BliffoscopeRes.TestData;
    // Parsing pixel maps of torpedo, starship and test data
    var pixelMapTorpedo = BliffoscopeRes.SlimeTorpedo;
    var pixelMapStarship = BliffoscopeRes.Starship;

    // by default we do 70% threshold
    renderBliffoscopeScreen(70);

    // Helper functions

    function renderBliffoscopeScreen(threshold) {
        // cleaning canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // drawing main screen
        drawImage(pixelMapTestData, 'rgb(136, 136, 136)');
        var objectsToDraw = ['SlimeTorpedo', 'Starship'];
        var colors = {
            SlimeTorpedo: 'rgba(255, 0, 0, 0.5)',
            Starship: 'rgba(0, 54, 211, 0.5)'
        };
        objectsToDraw.forEach(function(objectType){
            BliffoscopeRes['positioned' + objectType].forEach(function(val, index){
                // early returning if threshold is too low
                if (parseInt(BliffoscopeRes['isReal' + objectType][index], 10) < threshold) {
                    return;
                }
                val.forEach(function(value){
                    drawImage(value, colors[objectType]);
                });
            });
        });
    }

    function drawPixel(x, y, fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }

    function drawImage(serializedImage, fillStyle) {
      for (var i = 0; i < serializedImage.length; i++) {
        drawPixel(serializedImage[i][0], serializedImage[i][1], fillStyle);
      }
    }

})();
