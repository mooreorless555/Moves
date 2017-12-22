MapOverlay.prototype = new google.maps.OverlayView();

      function MapOverlay(args) {


        // Initialize all properties.
        this.bounds_ = args.bounds;
        this.image_ = args.image ? args.image : '';
        this.map_ = args.map;
        this.id_ = args.id ? args.id : 'NO_ID';
        this.label_ = args.label ? args.label : '--';
        this.isMove_ = args.isMove;
        this.isAvatar_ = args.isAvatar;
        this.clickHandler_ = args.clickHandler ? args.clickHandler : null;

        this.div_ = null;

        // Explicitly call setMap on this overlay.
        this.setMap(args.map);
      }

      /**
       * onAdd is called when the map's panes are ready and the overlay has been
       * added to the map.
       */
      MapOverlay.prototype.onAdd = function() {

        // Initialize the onclick function
        var onClickFunc = this.clickHandler_;

        var div = document.createElement('div');
        var ionAv;
        var img;
        div.id = this.id_
        div.style.position = 'absolute';

        if (this.isMove_) {
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '10px';
        } else if (this.isAvatar_) {
            div.style.borderStyle = 'none';
            div.style.borderWidth = '0px';
        }

        // If there is an image, create the img element and attach it to the div.
        img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';
        if (this.isAvatar_) {
            ionAv = document.createElement('ion-avatar')
            ionAv.style.position = 'absolute';
            img.className = 'image-circle';
            // ionAv.className = 'small-pic';
            // img.className = 'image-size';
        }
        img.style.position = 'absolute';
        if (this.image_ != '') {
            if (this.isAvatar_) {
                // ionAv.appendChild(img)
                div.appendChild(img)
            } else {
                div.appendChild(img);
            }
        }

        this.div_ = div;

        // Add the element to the "overlayLayer" pane.
        var panes = this.getPanes();
        var me = this;
        panes.overlayLayer.appendChild(div);

        this.getPanes().overlayMouseTarget.appendChild(div);
        google.maps.event.addDomListener(div, 'click', function(){
            onClickFunc()
        });  
      };

      MapOverlay.prototype.draw = function() {

        // We use the south-west and north-east
        // coordinates of the overlay to peg it to the correct position and size.
        // To do this, we need to retrieve the projection from the overlay.
        var overlayProjection = this.getProjection();

        // Retrieve the south-west and north-east coordinates of this overlay
        // in LatLngs and convert them to pixel coordinates.
        // We'll use these coordinates to resize the div.
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

        // Resize the image's div to fit the indicated dimensions.
        var div = this.div_;
        var width = 200;
        var height = 200;
        if (this.isAvatar_) {
            width = 50;
            height = 50;
        }
        if (this.isMove_) div.innerHTML = this.label_;
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        div.style.left = (sw.x - width/2) + 'px';
        div.style.top = (ne.y - height/2) + 'px';
        if (this.isMove_) div.className = 'map-component-item';
        if (this.isAvatar_) {
            div.className = 'circle-avatar';
            div.style.borderRadius = '50%';
        }
        this.div_ = div;
      };

      // The onRemove() method will be called automatically from the API if
      // we ever set the overlay's map property to 'null'.
      MapOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      };

      MapOverlay.prototype.getElement = function() {
          var id = this.id_
          console.log('Getting id...', id);
          return $('#'+id)
      }