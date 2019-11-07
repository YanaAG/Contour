window.onload = function () {
    var values = {
        paths: 50,
        minPoints: 5,
        maxPoints: 15,
        minRadius: 30,
        maxRadius: 90
    };

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    var tool = new paper.Tool();

    var canvas = document.getElementById('canvas');
    paper.setup(canvas);

    createPaths();

    paper.view.draw();

    function createPaths() {
        var center = {
            width: 0,
            height: 0
        };
        var radiusDelta = values.maxRadius - values.minRadius;
        var pointsDelta = values.maxPoints - values.minPoints;
        for (var i = 0; i < values.paths; i++) {
            var radius = values.minRadius + Math.random() * radiusDelta;
            var points = values.minPoints + Math.floor(Math.random() * pointsDelta);
            var p = paper.Point.random();
            center.width = paper.view.size.width * p.x;
            center.height = paper.view.size.height * p.y;
            var path = createBlob(center, radius, points);
            var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
            var hue = Math.random() * 360;
            path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
            path.strokeColor = 'black';
        }
    }

    function createBlob(center, maxRadius, points) {
        var point_to_add = {
            width: 0,
            height: 0
        };
        var path = new paper.Path();
        path.closed = true;
        for (var i = 0; i < points; i++) {
            var delta = new paper.Point({
                length: (maxRadius * 0.5) + (Math.random() * maxRadius * 0.5),
                angle: (360 / points) * i
            });
            point_to_add.width = center.width + delta.x;
            point_to_add.height = center.height + delta.y;
            path.add(point_to_add);
        }
        path.smooth();
        return path;
    }

    var segment, path;
    var movePath = false;

    tool.onMouseDown = function(event) {
        segment = path = null;
        var hitResult = paper.project.hitTest(event.point, hitOptions);
        if (!hitResult)
            return;

        if (event.modifiers.shift) {
            if (hitResult.type === 'segment') {
                hitResult.segment.remove();
            }
            return;
        }

        if (hitResult) {
            path = hitResult.item;
            if (hitResult.type === 'segment') {
                segment = hitResult.segment;
            } else if (hitResult.type === 'stroke') {
                var location = hitResult.location;
                segment = path.insert(location.index + 1, event.point);
                path.smooth();
            }
        }
        movePath = hitResult.type === 'fill';
        if (movePath)
            paper.project.activeLayer.addChild(hitResult.item);
    };

    tool.onMouseMove = function(event) {
        paper.project.activeLayer.selected = false;
        if (event.item)
            event.item.selected = true;
    };

    tool.onMouseDrag = function(event) {
        if (segment) {
            segment.point.x = segment.point.x + event.delta.x;
            segment.point.y = segment.point.y + event.delta.y;
            path.smooth();
        } else if (path) {
            path.position.x = path.position.x + event.delta.x;
            path.position.y = path.position.y + event.delta.y;
        }
    }
};