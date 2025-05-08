/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "atpreport/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("atpreport.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                var userLang = jQuery.sap.getUriParameters().get("eplang");
                console.log("Component userLang:", userLang);

                if (userLang == "ES") {
                    var i18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleName: "atpreport.i18n.i18n_es"
                    });
                }
                else {
                    var i18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleName: "atpreport.i18n.i18n"
                    });
                }
                this.setModel(i18nModel, "i18n");
            }
        });
    }
);