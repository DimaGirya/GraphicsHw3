const app = angular.module("graphicCourseHw3", []);
app.controller("ctrl", function ($scope) {

    let canvasContext;
    let canvas;
    let copyOfData;
    let center, min, max;
    let canvasWidth = 800;
    let canvasHeight = 800;

    $scope.scaleFactor = 0.5;
    $scope.rotateAngle = 45;
    $scope.projection = "parallel";

    window.onload = function () {
        canvas = document.getElementById("workingZone");
        canvasContext = canvas.getContext("2d");
        copyOfData = angular.copy(data);
        //fit the data according the canvas size
        normalizeData(data);
        //draw the shapes that defined in the data.js file on the canvas.
        drawScene(data);
    };

    // -------------GUI functions--------------
    //change the projection type according to the user selection
    $scope.projectionChange = function () {
        normalizeData(data);
        switch ($scope.projection) {
            case "parallel": {
                data.shapes.forEach(shape => {
                    paralleProjectionShape(data, shape);
                });
                break;
            }
            case "cabinet": {
                data.shapes.forEach(shape => {
                    cabinetProjectionShape(data, shape);
                });
                break;
            }
            case "prespctive": {
                data.shapes.forEach(shape => {
                    prespctiveProjectionShape(data, shape);
                });
                break;
            }
        }
        normalizeData(data);
        drawScene(data);
    };

    $scope.resetBoard = function () {
        data = copyOfData;
        clearBoard();
        normalizeData(data);
        drawScene(data);
    };

    /*rotation functions. will be execute according the user rotate in axis button*/
    $scope.rotateX = function () {
        normalizeData(data);
        let polygons = data.polygons;
        let vertices = data.vertices;
        data.shapes.forEach(shape => {
            rotateShapeX(shape, polygons, vertices, $scope.rotateAngle);
        });
        normalizeData(data);
        drawScene(data);
    };

    $scope.rotateY = function () {
        normalizeData(data);
        let polygons = data.polygons;
        let vertices = data.vertices;
        data.shapes.forEach(shape => {
            rotateShapeY(shape, polygons, vertices, $scope.rotateAngle);
        });
        normalizeData(data);
        drawScene(data);
    };

    $scope.rotateZ = function () {
        normalizeData(data);
        let polygons = data.polygons;
        let vertices = data.vertices;
        data.shapes.forEach(shape => {
            rotateShapeZ(shape, polygons, vertices, $scope.rotateAngle);
        });
        normalizeData(data);
        drawScene(data);
    };

    /*scaling function. will be execute after the user pressed the zoom button*/
    $scope.zoom = function () {
        normalizeData(data);
        data.shapes.forEach(shape => {
            zoomShapes(data, shape, $scope.scaleFactor);
        });
        normalizeData(data);
        drawScene(data);
    };


    // -------------------- Shape calculation level--------
    function cabinetProjectionShape(data, shape) {
        shape.polygons.forEach(polygonId => {
            let polygon = getPolygonById(data.polygons, polygonId);
            cabinetProjectionPolygon(data, polygon);
        })
    }

    function paralleProjectionShape(data, shape) {
        shape.polygons.forEach(polygonId => {
            let polygon = getPolygonById(data.polygons, polygonId);
            paralleProjectionPolygon(data, polygon);
        })
    }

    function prespctiveProjectionShape(data, shape) {
        shape.polygons.forEach(polygonId => {
            let polygon = getPolygonById(data.polygons, polygonId);
            prespctiveProjectionPolygon(data, polygon);
        })
    }

    function zoomShapes(data, shape, scaleFactor) {
        shape.polygons.forEach(polygonId => {
            let polygon = getPolygonById(data.polygons, polygonId);
            zoomPolygon(data, polygon, scaleFactor);
        });

    }

    function rotateShapeX(shape, polygons, vertices, angle) {
        let shapePolygonsIds = shape.polygons;
        let polygon = null;
        shapePolygonsIds.forEach(polygonId => {
            polygon = getPolygonById(polygons, polygonId);
            rotatePolygonInX(polygon, angle, vertices)
        })
    }

    function rotateShapeY(shape, polygons, vertices, angle) {
        let shapePolygonsIds = shape.polygons;
        let polygon = null;
        shapePolygonsIds.forEach(polygonId => {
            polygon = getPolygonById(polygons, polygonId);
            rotatePolygonInY(polygon, angle, vertices)
        })
    }

    function rotateShapeZ(shape, polygons, vertices, angle) {
        let shapePolygonsIds = shape.polygons;
        let polygon = null;
        shapePolygonsIds.forEach(polygonId => {
            polygon = getPolygonById(polygons, polygonId);
            rotatePolygonInZ(polygon, angle, vertices)
        })
    }

    // -------------------- Polygons calculation level --------
    function cabinetProjectionPolygon(data, polygon) {
        polygon.vertices.forEach(vertexId => {
            let vertex = getPolygonById(data.vertices, vertexId);
            vertex.x = Math.round(vertex.x + vertex.z * Math.cos(Math.PI * (10 / 180)));
            vertex.y = Math.round(vertex.y + vertex.z * Math.sin(Math.PI * (10 / 180)));
        })
    }

    function paralleProjectionPolygon(data, polygon) {
        let temp1;
        let temp2;
        polygon.vertices.forEach(vertexId => {
            let vertex = getPolygonById(data.vertices, vertexId);
            temp1 = vertex.x;
            temp2 = vertex.y;
            vertex.x = temp2;
            vertex.y = temp1;
        })
    }

    function prespctiveProjectionPolygon(data, polygon) {
        polygon.vertices.forEach(vertexId => {
            let vertex = getPolygonById(data.vertices, vertexId);
            vertex.x = vertex.x + ( vertex.z / 10);
            vertex.y = vertex.y + ( vertex.z / 10);
        });
    }

    function zoomPolygon(data, polygon, scaleFactor) {
        polygon.vertices.forEach(vertexId => {
            let vertex = getPolygonById(data.vertices, vertexId);
            vertex.x *= scaleFactor;
            vertex.y *= scaleFactor;
            vertex.z *= scaleFactor;
        })
    }

    function rotatePolygonInX(polygon, angle, vertices) {
        let length = polygon.vertices.length;
        angle = angle * (Math.PI / 180);
        let currentVertices;
        let y;
        for (let i = 0; i < length; i++) {
            currentVertices = getVerticesById(vertices, polygon.vertices[i]);
            y = currentVertices.y;
            currentVertices.y = currentVertices.y * Math.cos(angle) - currentVertices.z * Math.sin(angle);
            currentVertices.z = y * Math.sin(angle) + currentVertices.z * Math.cos(angle);
        }
    }

    function rotatePolygonInY(polygon, angle, vertices) {
        let length = polygon.vertices.length;
        angle = angle * (Math.PI / 180);
        let currentVertices;
        let x;
        for (let i = 0; i < length; i++) {
            currentVertices = getVerticesById(vertices, polygon.vertices[i]);
            x = currentVertices.x;
            currentVertices.x = currentVertices.x * Math.cos(angle) + currentVertices.z * Math.sin(angle);
            currentVertices.z = -x * Math.sin(angle) + currentVertices.z * Math.cos(angle);
        }
    }

    function rotatePolygonInZ(polygon, angle, vertices) {
        let length = polygon.vertices.length;
        angle = angle * (Math.PI / 180);
        let currentVertices;
        let x;
        for (let i = 0; i < length; i++) {
            currentVertices = getVerticesById(vertices, polygon.vertices[i]);
            x = currentVertices.x;
            currentVertices.x = currentVertices.x * Math.cos(angle) - currentVertices.y * Math.sin(angle);
            currentVertices.y = x * Math.sin(angle) + currentVertices.y * Math.cos(angle);
        }
    }

    //------------ Get objects by id functions------------
    function getPolygonById(polygons, id) {
        let result = null;
        let length = polygons.length;
        for (let i = 0; i < length; i++) {
            if (polygons[i].id === id) {
                result = polygons[i];
                break;
            }
        }
        if (result === null) {
            throw "getPolygonById returned null"
        }
        return result;
    }

    function getVerticesById(vertices, id) {
        let result = null;
        let length = vertices.length;
        for (let i = 0; i < length; i++) {
            if (vertices[i].id === id) {
                result = vertices[i];
                break;
            }
        }
        if (result === null) {
            throw "getVerticesById returned null"
        }
        return result;
    }

    // --------------- normalize data functions------------
    function normalizeData(data) {
        let vertices = data.vertices;
        let length = vertices.length;
        setMaxMinCenter(data);
        let point = {
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            z: 150
        };
        for (let i = 0; i < length; i++) {
            vertices[i].x += point.x - center.x;
            vertices[i].y += point.y - center.y;
            vertices[i].z += point.z - center.z;
        }
        setMaxMinCenter(data);
    }

    function resetCenterMinMax() {
        center = {
            x: 0,
            y: 0,
            z: 0
        };

        max = {
            x: 0,
            y: 0,
            z: 0
        };
        min = {
            x: Infinity,
            y: Infinity,
            z: Infinity
        };
    }

    function setMaxMinCenter(data) {
        resetCenterMinMax();
        let vertices = data.vertices;
        let length = vertices.length;
        for (let i = 0; i < length; i++) {
            if (max.x < vertices[i].x) {
                max.x = vertices[i].x;
            }
            if (max.y < vertices[i].y) {
                max.y = vertices[i].y;
            }
            if (max.z < vertices[i].z) {
                max.z = vertices[i].z;
            }
            if (min.x > vertices[i].x) {
                min.x = vertices[i].x;
            }
            if (min.y > vertices[i].y) {
                min.y = vertices[i].y;
            }
            if (min.z > vertices[i].z) {
                min.z = vertices[i].z;
            }
        }
        center.x = Math.round(max.x - ((max.x - min.x) / 2));
        center.y = Math.round(max.y - ((max.y - min.y) / 2));
        center.z = Math.round(max.z - ((max.z - min.z) / 2));
    }


    // ------------- Drawing functions-------------
    function drawScene(sceneData) {
        let shapes = sceneData.shapes;
        let vertices = sceneData.vertices;
        let polygons = sceneData.polygons;
        clearBoard();
        shapes.forEach(shapes => {
            drawShape(shapes, polygons, vertices);
        });
    }

    function drawShape(shape, polygons, vertices) {
        let shapePolygonsIds = shape.polygons;
        let polygon = null;
        shapePolygonsIds.forEach(polygonId => {
            polygon = getPolygonById(polygons, polygonId);
            drawPolygon(polygon, vertices);
        })
    }

    function drawPolygon(polygon, vertices) {
        canvasContext.fillStyle = polygon.color;
        canvasContext.beginPath();
        let firstVertices = getVerticesById(vertices, polygon.vertices[0]);
        let currentVertices = null;
        let length = polygon.vertices.length;
        canvasContext.moveTo(firstVertices.x, firstVertices.y);
        for (let i = 1; i < length; i++) {
            currentVertices = getVerticesById(vertices, polygon.vertices[i]);
            canvasContext.lineTo(currentVertices.x, currentVertices.y);
        }
        canvasContext.lineTo(firstVertices.x, firstVertices.y);
        canvasContext.fill();
        canvasContext.closePath();
    }

    function clearBoard() {
        canvasContext.clearRect(0, 0, 800, 800);
    }

});