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

            // set model size limit
            var oModel = this.getOwnerComponent().getModel();
                oModel.setSizeLimit(500);
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
                    oModel.refresh(true);
                    sap.m.MessageBox.success("Operación ejecutada correctamente");                  
                },
                error: function(error){
                    sap.m.MessageBox.error("Error al ejecutar la operación");
                }
            })
        },

        onGetTasaUSD: function(oEvent){
            let oView = this.getView();
            let oModel = this.getView().getModel();
            let rowSelected = this.getView().byId("testTable").getSelectedItem();
            // Comprobamos que se haya seleccionado una fila, si no, mostramos un mensaje de error
            if(!rowSelected){
                // añade mensaje de error
                sap.m.MessageBox.error("Se necesita seleccionar al menos una fila para ejecutar la acción");
                return;
            } 
            // recogemos las propiedades que se necesitan (deberás ver cuáles son en la descripción del function import en el metadata)
            let rowObject = rowSelected.getBindingContext().getObject() // nos devolverá el objeto al que hace referencia la fila
            let currency = rowObject.Moneda;
            let activeEntityFlag = rowObject.IsActiveEntity;
            
            oModel.callFunction("/get_tasa_usd", {
                method: 'POST',
                urlParameters: {
                    Moneda: currency,
                    IsActiveEntity: activeEntityFlag
                },
                success: function(data){
                    oModel.refresh(true);
                    sap.m.MessageBox.success("Operación ejecutada correctamente");
                },
                error: function(error){
                    sap.m.MessageBox.error("Error al ejecutar la operación");
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