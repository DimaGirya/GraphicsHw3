const app = angular.module("graphicCourseHw3", []);
app.controller("ctrl", function ($scope) {

    let canvasContext;
    let canvas;
    let copyOfData;
    let center, min, max;
    let canvasWidth = 800;
    let canvasHeight = 800;

    window.onload = function () {
        canvas = document.getElementById("workingZone");
        canvasContext = canvas.getContext("2d");
        copyOfData = angular.copy(data);
        normalizeData(data);
        drawScene(data);
    };

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

    function rotatePolygonInX(polygon, angle, vertices) {
        let length = polygon.vertices.length;
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
        let currentVertices;
        let x;
        for (let i = 0; i < length; i++) {
            currentVertices = getVerticesById(vertices, polygon.vertices[i]);
            x = currentVertices.x;
            currentVertices.x = currentVertices.x * Math.cos(angle) - currentVertices.y * Math.sin(angle);
            currentVertices.y = x * Math.sin(angle) + currentVertices.y * Math.cos(angle);
        }
    }

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

    function drawShape(shape, polygons, vertices) {
        let shapePolygonsIds = shape.polygons;
        let polygon = null;
        shapePolygonsIds.forEach(polygonId => {
            polygon = getPolygonById(polygons, polygonId);
            drawPolygon(polygon, vertices);
        })
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

    function zoomShape(vertices, zoomFactor) {
        vertices.forEach(vertex => {
            vertex.x *= zoomFactor;
            vertex.y *= zoomFactor;
            vertex.z *= zoomFactor;
        })

    }

    function clearBoard() {
        canvasContext.clearRect(0, 0, 800, 800);
    }


    function drawScene(sceneData) {
        console.log(sceneData);
        let shapes = sceneData.shapes;
        let vertices = sceneData.vertices;
        let polygons = sceneData.polygons;
        zoomShape(vertices, 2.0);
        normalizeData(sceneData);
        for (let i = 0; i < 100; i++) {
            i++;
            window.setTimeout(() => {
                console.log(i);
                clearBoard();

                shapes.forEach(shapes => {
                    rotateShapeX(shapes, polygons, vertices, i * 0.01);
                    rotateShapeY(shapes, polygons, vertices, i * 0.01);
                    rotateShapeZ(shapes, polygons, vertices, i * 0.01);
                    drawShape(shapes, polygons, vertices);
                });
            }, 1000 * i);
        }
    }


    /*
     function drawScene(sceneData) {
     let shapes = sceneData.shapes;
     let vertices = sceneData.vertices;
     let polygons = sceneData.polygons;
     shapes.forEach(shapes => {
     rotateShapeY(shapes, polygons, vertices, 0);
     drawShape(shapes, polygons, vertices);
     });
     }
     */
});
