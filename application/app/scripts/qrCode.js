/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true, unused: false*/
/*global angular, QRCode, QRErrorCorrectLevel*/


window.getQR = function(text) {

    'use strict';

    var dotsize = 2;  // size of box drawn on canvas
    var padding = 10; // (white area around your QRCode)
    var black = "rgb(0,0,0)";
    var white = "rgb(255,255,255)";
    var QRCodeVersion = 15; // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

    var canvas=document.createElement('canvas');
    var qrCanvasContext = canvas.getContext('2d');
    try {
        // QR Code Error Correction Capability
        // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
        // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
        // eg. L can survive approx 5% damage...etc.
        var qr = new QRCode(QRCodeVersion, QRErrorCorrectLevel.L);
        qr.addData(text);
        qr.make();

        var qrsize = qr.getModuleCount();
        canvas.setAttribute('height',(qrsize * dotsize) + padding);
        canvas.setAttribute('width',(qrsize * dotsize) + padding);
        var shiftForPadding = padding/2;
        if (canvas.getContext){
            for (var r = 0; r < qrsize; r++) {
                for (var c = 0; c < qrsize; c++) {
                    if (qr.isDark(r, c)) {
                        qrCanvasContext.fillStyle = black;
                    } else {
                        qrCanvasContext.fillStyle = white;
                    }
                    qrCanvasContext.fillRect ((c*dotsize) +shiftForPadding,(r*dotsize) + shiftForPadding,dotsize,dotsize);   // x, y, w, h
                }
            }
        }
        return canvas.toDataURL("image/png");
    }
    catch(err) {

        console.log('Unable to generate QR', text, err);

    }

    return "";
};