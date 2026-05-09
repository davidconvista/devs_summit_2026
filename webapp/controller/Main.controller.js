sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Messaging",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "devssummit2026/model/formatter",
], (Controller, Filter, FilterOperator,JSONModel, Messaging, Message, MessageBox, formatter) => {
    "use strict";

    return Controller.extend("devssummit2026.controller.Main", {
        formatter: formatter, 

        onInit() {
            const oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");

            // set message model
			this.getView().setModel(Messaging.getMessageModel(), "message");
            // activate automatic message generation for complete view
			Messaging.registerObject(this.getView(), true);
        },

        onSearch: function(oEvent){
           
            let queryToSearch = oEvent.getParameter("query");
            let table = this.getView().byId("testTable");
            let binding = table.getBinding("items");
            let aFilters = [];
            if(queryToSearch){
                aFilters.push(
                    new Filter({
                        filters: [
                            new Filter("Region", FilterOperator.Contains, queryToSearch),
                            new Filter("Nombre", FilterOperator.Contains, queryToSearch)
                        ],
                        and: false  // OR entre los dos campos: código OR descripción
                    })
                )
            }
            // let filter = new sap.ui.model.Filter({
            //     path: "Region",
            //     operator: sap.ui.model.FilterOperator.Contains,
            //     value1: queryToSearch
            // })
            binding.filter(aFilters)

        },

        onSelectingCurrency: function(oEvent){
            let currencyCode = oEvent.getSource().getSelectedKey();
            let table = this.getView().byId("testTable");
            let binding = table.getBinding("items");
            let aFilters = [];
            if(currencyCode){
                aFilters.push(new Filter("Moneda", FilterOperator.Contains, currencyCode));
            }
            binding.filter(aFilters)
        },

        onCurrencyPress: function(oEvent){
            const oItem = oEvent.getSource();
            const oRouter = this.getOwnerComponent().getRouter();
            const bindingPath = oItem.getBindingContext().getPath().substring(1);
			oRouter.navTo("detail", {
				currencyPath: window.encodeURIComponent(bindingPath)
			});
        },

        onNavigateToSmartView: function(oEvent){
            const oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("smartview", {}, true);
        },

        onUploadData: function(oEvent){
            let oView = this.getView();
            let oModel = this.getView().getModel();
            oModel.callFunction("/upload_data_api", {
                method: 'POST',
                success: function(data){
                    Messaging.removeAllMessages();
                    data.results.forEach(function(message){
                        const oMessage = new Message({
                            message: message.Message,
                            type: formatter.formatMessageType(message.Type),
                            target: "/Dummy",
                            processor: oView.getModel()
                        });
                        Messaging.addMessages(oMessage);
                    })                    
                },
                error: function(error){
                    debugger;
                }
            })
        },

        onGetTasaUSD: function(oEvent){
            let oView = this.getView();
            let oModel = this.getView().getModel();
            oModel.callFunction("/get_tasa_usd", {
                method: 'POST',
                urlParameters: {
                    Moneda: 'EUR',
                    IsActiveEntity: true
                },
                success: function(data){
                    Messaging.removeAllMessages();
                    data.results.forEach(function(message){
                        const oMessage = new Message({
                            message: message.Message,
                            type: formatter.formatMessageType(message.Type),
                            target: "/Dummy",
                            processor: oView.getModel()
                        });
                        Messaging.addMessages(oMessage);
                    }) 
                },
                error: function(error){
                    debugger;
                }
            })
        },

        async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

        _getMessagePopover() {
			return this.loadFragment({
				name: "devssummit2026.view.fragments.messagePopover"
			});
		},

        onCreateTest: function(){
            let oModel = this.getView().getModel();
            let payload = {
                Moneda : "USD",
                IsActiveEntity: true
            }
            oModel.create("/ZC_FOREX_CURRENCY",payload, {
                success: function(data){
                    MessageBox.success("Moneda creada satisfactoriamente");
                },
                error: function(error){
                    MessageBox.error("Ocurrió un error al intentar crear la moneda");
                }
            })
        },

        onDeleteTest: function(){
            let oModel = this.getView().getModel();
            let table = this.getView().byId("testTable");
            let selectedRow = table.getSelectedItem();
            let bindingPath = selectedRow.getBindingContext().getPath();
            if(selectedRow){
                oModel.remove(bindingPath, {
                    success: function(data){
                        MessageBox.success("Moneda borrada satisfactoriamente");
                    },
                    error: function(error){
                        MessageBox.error("Ocurrió un error al intentar borrar la moneda");
                    }
                })
            }else{
                // error message
                MessageBox.error("Se necesita seleccionar al menos una fila para borrar de la tabla");
            }
        }
    });
});