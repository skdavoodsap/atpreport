sap.ui
	.define(
		['sap/m/Button',
			'sap/m/Dialog',
			'sap/m/Label',
			'sap/m/MessageToast',
			'sap/m/Text',
			'sap/ui/core/mvc/Controller',
			'sap/ui/core/util/Export',
			'sap/ui/core/util/ExportTypeCSV',
			'sap/ui/core/util/File',
			"sap/ui/export/library",
			"sap/ui/export/Spreadsheet",
			'sap/ui/model/json/JSONModel',
			'sap/m/MessageBox',
			'sap/ui/core/format/NumberFormat',
			'sap/ui/Device',
			"sap/ui/model/Filter",
			"sap/ui/model/FilterOperator",
			"sap/ui/model/Sorter",
			"sap/ui/core/Fragment",
			"sap/m/MessageStrip",
			"../model/formatter"
		],
		function (Button, Dialog, Label, MessageToast, Text, 
			BaseController, Export, ExportTypeCSV, File, ExportLibrary, Spreadsheet,
			JSONModel, MessageBox, NumberFormat, Device,
			Filter, FilterOperator, Sorter, Fragment, MessageStrip, formatter) {
			"use strict";
			var that = this;
			var oView;
			const EdmType = ExportLibrary.EdmType;
			return BaseController.extend("atpreport.controller.atpView", {
				formatter: formatter,
				/**
				 * Called when a controller is
				 * instantiated and its View controls
				 * (if available) are already created.
				 * Can be used to modify the View before
				 * it is displayed, to bind event
				 * handlers and do other one-time
				 * initialization.
				 *
				 * @memberOf dtsdealerapp.dtsClaimsSearch
				 */
				//shaikd Date : 07/Jan/2025 
				onInit: function () {
					this.claimsByUser = null;
					this.isClaimsDateFrom = null;
					this.isClaimsDateTo = null;
					this.statusTypes = null;
					this.textDealerName = null;
					this.selectedStatusTypes = "";

					this.isUserAdmin = "N";
					this.isUserView = 'N';
					this.userInfo = null;

					this.programTypes = 'ALL';
					this.selectedProgramTypes = "";
					console.log("In Controller");
					var oComponent = this.getOwnerComponent();
					this.oBackendModel = oComponent.getModel("CompModel");
					//	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					//	oRouter.attachRouteMatched(this.onDataReceived , this);

					oView = this.getView();
					var that = this;
					// set message model
					var oMessageManager = sap.ui.getCore().getMessageManager();
					oView.setModel(oMessageManager.getMessageModel(), "message");
					// or just do it for the whole view
					oMessageManager.registerObject(oView, true);

					// set device model
					var oDeviceModel = new JSONModel(Device);
					//oDeviceModel.setDefaultBindingMode("OneWay");
					oView.setModel(oDeviceModel, "device");

					this.claimHeaderDetails = null;

					this.userID = null;
					this.plantID = null;
					this.initrun = 'Y';
					this.epuser = "";
					var total = 0;
					this.returnMessage = "";
					this.isDefectREquired = "";
					this.dealerCheck = "E";

					userIDPortal = jQuery.sap
						.getUriParameters().get(
							"epuser");
					console.log("userIDPortal:",
						userIDPortal);

					this.userEmailID = jQuery.sap
						.getUriParameters().get(
							"epmail");
					console.log("userEmailID:",
						userEmailID);

					this.userFname = jQuery.sap
						.getUriParameters().get(
							"epfname");
					this.userLname = jQuery.sap
						.getUriParameters().get(
							"eplname");
					//console.log("userFname:", this.userFname);
					//console.log("userLname:", this.userLname);
					// this.epuser="";
					// get application parameter from
					// iView
					if (jQuery.sap.getUriParameters() != null
						&& jQuery.sap
							.getUriParameters() != undefined) {
						console.log("epuser1:",
							this.epuser);
						if (jQuery.sap
							.getUriParameters()
							.get("epuser") != null
							&& jQuery.sap
								.getUriParameters()
								.get("epuser") != undefined) {
							console.log("epuser2:",
								this.epuser);
							this.epuser = jQuery.sap
								.getUriParameters()
								.get("epuser")
								.trim();
							console.log("epuser:",
								this.epuser);
							if (this.epuser == "2") {
								// some code..
								console.log("epuser:",
									this.epuser);
							}
							if (this.epuser == "3") {
								// some code..
								console.log("epuser:",
									this.epuser);
							}
						}
					}

					if (this.epuser != ""
						&& this.epuser != null
						&& this.epuser != undefined) {
						this.userID = this.epuser
							.toUpperCase();
						//this.onGetCompCodes(this.userID);
					}

					else {
						this.userID = "PURCIAT";
						this.userEmailID = 'purciat@sharpsec.com';
					}
					//this.onGetCompCodes(this.userID);
					//this.onLoadProgramTypes();


					// this.onUIUpdate();
					var toDate = that.yyyymmdd1(new Date());
					//toDateMdl = that.yyyymmdd1(today);
					//	var frmDate  = toDate.setMonth(toDate.getMonth() - 6);
					var oGlobalModel = new JSONModel({
						MatNum: "",
						ReqDate: toDate,
						ToDate: "",
						Size: 0,
						Currency: "",
						TotalOpen: 400,
						TotalCleared: 600,
						TotVis: false,
						TotClearVis: false,
						TotOpenVis: false,
						DatesVis: false,
						pastXDVis: false,
						fixedBottom: 0,
						globalFilter: ""
					});
					oGlobalModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
					//sap.ui.getCore().setModel(oGlobalModel,"oGlobalModel");
					this.getView().setModel(oGlobalModel, "oGlobalModel");
					//this.onDatesInitClaims();
					var oColModel = new JSONModel({
						"column": [
							{
								"label": "Material",
								"template": "Matnr",
								"width": "5rem"
							},
							{
								"label": "Material Description",
								"template": "Maktx"
							}
						]
					});
					this.getView().setModel(oColModel, "oColModel");
					// this.MatnrF4();
					this.oSF = this.getView().byId("idInptMaterial");

				},
				MatnrF4: function () {
					sap.ui.core.BusyIndicator.show();
					var oModel = that.getView().getModel("oGlobalModel");
					oModel.setProperty("/globalFilter", "");
					var servPath = "/SearchListMatnrSet?$filter=(Matnr eq '318')";
					// call odata method
					this.getModel().read(servPath, {
						async: true, success: function (oData) {


							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.results);
							that.getView().setModel(oModel, "matnr");
							sap.ui.core.BusyIndicator.hide();
						},
						error: function (
							oError) {
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							that.onUserMessage(message, "E");
							result = "S";

						}
					});


				},

				onSearch11: function (event) {
					var that = this;
					var value = event.getParameter("query");
					var filters = [];
					if (value) {
						filters = [
							new sap.ui.model.Filter([
								new sap.ui.model.Filter("Matnr", function (sText) {
									return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
								}),
								new sap.ui.model.Filter("Maktx", function (sDes) {
									return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
								})
							], false)
						];
					}

					if (this.oSF.getBinding("suggestionItems") !== undefined) {
						this.oSF.getBinding("suggestionItems").filter(filters);
						this.oSF.suggest();
					}
					var oModel = that.getView().getModel("oGlobalModel");
					var item = event.getParameter("suggestionItem");
					if (item) {
						sap.m.MessageToast.show("search for: " + item.getText());
						oModel.setProperty("/MatNum", item.getText());
					}


				},

				onSuggest: function (event) {
					var that = this;
					var value = event.getParameter("suggestValue");
					var oFiletRef = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, value);
					var servPath = "/SearchListMatnrSet?$filter=(Matnr eq '" + value + "')";
					// call odata method
					this.getView().getModel().read("/SearchListMatnrSet", {
						filters: [oFiletRef],
						success: function (oData) {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oData.results);
							that.getView().setModel(oModel, "matnr");
							sap.ui.core.BusyIndicator.hide();
						},
						error: function (
							oError) {
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							that.onUserMessage(message, "E");
							result = "S";

						}
					});

					var filters = [];
					if (value) {
						filters = [
							new sap.ui.model.Filter([
								new sap.ui.model.Filter("Matnr", function (sText) {
									return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
								}),
								new sap.ui.model.Filter("Maktx", function (sDes) {
									return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
								})
							], false)
						];
					}
					if (this.oSF.getBinding("suggestionItems") !== undefined) {
						this.oSF.getBinding("suggestionItems").filter(filters);
						this.oSF.suggest();
					}
				},
				spaceWidth: function () {
					var deviceModel = that.getView().getModel("device");
					debugger;
					//deviceModel.getData().system.phone = true;
					if (deviceModel.getData().system.phone == true) {
						return '2rem';
					}
					else {
						return '56rem';
					}

				},

				onValueHelpRequested: function () {
					var that = this;

					var aCols = that.getView().getModel("oColModel").getData().column;

					// create dialog via fragment factory
					this._oValueHelpDialog = sap.ui.xmlfragment(that.getView().getId(), "atpreport.view.valuehelp");
					// connect dialog to view (models, lifecycle)
					that.getView().addDependent(oDialog);
					//oDialog.open();


					this._oValueHelpDialog = oFragment;
					that.getView().addDependent(this._oValueHelpDialog);

					this._oValueHelpDialog.getTableAsync().then(function (oTable) {
						oTable.setModel(that.getView().getModel("matnr"));
						oTable.setModel(that.getView().getModel("oColModel"), "columns");

						if (oTable.bindRows) {
							oTable.bindAggregation("rows", "/");
						}
						if (oTable.bindItems) {
							oTable.bindAggregation("items", "/", function () {
								return new ColumnListItem({
									cells: aCols.map(function (column) {
										return new Label({ text: "{" + column.template + "}" });
									})
								});
							});
						}

						this._oValueHelpDialog.update();
					}.bind(this));

					var oToken = new Token();
					oToken.setKey(this._oInput.getSelectedKey());
					oToken.setText(this._oInput.getValue());
					this._oValueHelpDialog.setTokens([oToken]);
					this._oValueHelpDialog.open();

				},

				onValueHelpOkPress: function (oEvent) {
					var aTokens = oEvent.getParameter("tokens");
					this._oInput.setSelectedKey(aTokens[0].getKey());
					this._oValueHelpDialog.close();
				},

				onValueHelpCancelPress: function () {
					this._oValueHelpDialog.close();
				},

				onValueHelpAfterClose: function () {
					this._oValueHelpDialog.destroy();
				},

				resetTable: function () {
	
					var table = that.getView().byId("tableReporting");

					var iColCounter = 0;
					table.clearSelection();
					var iTotalCols = table.getColumns().length;
					var oListBinding = table.getBinding();
					if (oListBinding) {
						oListBinding.aSorters = null;
						oListBinding.aFilters = null;
					}
					table.getModel("openItems").refresh(true);
					for (iColCounter = 0; iColCounter < iTotalCols; iColCounter++) {
						table.getColumns()[iColCounter].setSorted(false);
						table.getColumns()[iColCounter].setFilterValue("");
						table.getColumns()[iColCounter].setFiltered(false);
					}
				},
				createPDF: function () {

					// Default export is a4 paper, portrait, using milimeters for units
					var that = this;
					// Default export is a4 paper, portrait, using milimeters for units
					var doc = new jsPDF();
					var openItems = that.getView().getModel("openItems");
					debugger;
					if (openItems != null) {
						var aData = null;
						var aData1= null;
						aData1 = openItems.oData;						
						aData = [{
							"Name": "Warehouse",
							"VAlloc": "",
							"VAtp": "Available Quantity",
							"VBwtar": "",
							"VDate": "Requirement Date",
							"VMaktx": "",
							"VMatnr": "",
							"VRule": "",
							"VUserid": "",
							"VVkorg": "",
							"Werks": "Plant"
						}];
						aData = aData.concat(aData1);
						var imgData = "data:image/png;base64,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";
						//											//
						doc.addImage(imgData, 'PNG', 170, 5, 10, 5);
						doc.setFontStyle('bold');
						doc.setFontSize(8);
						doc.text(16, 8, 'ATP Report');

						//begin
						var y = 15;
						var x = 2;
						doc.setFontStyle('normal');
						for (var k = 0; k < aData.length; k++) {
							if (aData[k].VDate !== 'Total Quantity') {

								doc.setFontSize(8);
								var a1;
								var b1;
								if (aData[k].VDate !== 'Requirement Date') {
									a1 = that.formatter.dateFormat(aData[k].VDate).toString();
									b1 = that.formatter.quantityFormat(aData[k].VAtp).toString();
								}
								else{
									a1 = aData[k].VDate;
									b1= aData[k].VAtp;
								}

								for (var i = 0; i < 4; i++) {
									x = x + 35;
									if (i === 0) {
										doc.rect(x, y, 35, 5); // empty square
									} else {
										doc.rect(x, y, 35, 5); // empty square
									}

									if (i == 0) {
										doc.text(x + 1, y + 3, aData[k].Werks);
									}
									else if (i == 1) {
										doc.text(x + 1, y + 3, aData[k].Name);
									}
									else if (i == 2) {
										
										doc.text(x + 1, y + 3, a1);
									}
									else if (i == 3) {
										doc.text(x + 1, y + 3, b1);
										//doc.text(x + 1, y + 3, that.formatter.quantityFormat( aData[k].VAtp));
									}
								}
							}
							y = y + 5;
							x = 2;
						}

						doc.save('ATPReport.pdf')
					}
					else {
						MessageBox.error("Error when downloading data. PDF generate is not possible because no model was set.");
					}

				},

				onDataReceived: function (event) {
					var oModel = new sap.ui.model.json.JSONModel();
					var oView = this.getView();

					console.log("onDataReceived:");
					oModel.setData(this.programTypes);
					this.getView().setModel(oModel);
					oModel.refresh(true);
					this.getView().byId('idProgramTypeS')
						.setModel(oModel)
						.bindElement({
							path: '/results'
						});
					if (this.initrun == 'N') {
						oView.byId("idProgramTypeS")
							.setSelectedKey("ALL");
						this.oncustomClaims();
					}
					this.initrun = 'N';
					//this.onUIUpdate();
				},



				onGetCompCodesZZZ: function (userID) {
					var t = this;
					sap.ui.core.BusyIndicator.show();
					var serviceUrl = "/sap/opu/odata/SAP/ZACNTSUMMARY_SRV";
					if (window.location.hostname == "localhost") {
						serviceUrl = "proxy"
							+ serviceUrl;
					} else {
						serviceUrl = serviceUrl;
					};
					this.oData = new sap.ui.model.odata.ODataModel(serviceUrl);

					//var userID = 'SBSTST000';

					var vPath = "custSet?$filter= User eq '" + userID + "'";

					//var userID = null;

					this.oData
						.read(
							vPath,
							{
								async: true,
								success: function (oData) {
									debugger;
									if (oData.results.length > 0) {
										if (oData.results[0].Return.Type == "E") {
											t.onUserMessage(oData.results[0].Return.Message, "E");
										}
										else {
											// populate the com
											var oModel = new sap.ui.model.json.JSONModel();
											oModel.setData(oData.results);
											this.getView().setModel(oModel, "CompCodesModel");
										}


									} else {
										console
											.log(
												"No Data",
												oData);

										t.onUserMessageDialog();
									}


								},
								error: function (
									oError) {
									var data = JSON
										.stringify(oError);
									var message = $(
										oError.response.body)
										.find(
											"message")
										.first()
										.text();
									t
										.onUserMessage(
											message,
											"E");
									result = "S";

								}
							});
					sap.ui.core.BusyIndicator.hide();
					//return userID;
				},


				onUserMessageDialog: function () {
					var that = this;
					var dialog = new Dialog(
						{
							title: 'Error',
							type: 'Message',
							state: 'Error',
							content: new Text({
								text: "No User Data Found, Please contact Administrator",
							}),
							//														beginButton : new Button(
							//																{
							//																	text : 'OK',
							//																	press : function() {
							//																		dialog
							//																				.close();
							//																		if (mType == "Success")
							//																			that
							//																					.onMainScreen();
							//																	}
							//																}),
							//														afterClose : function() {
							//															dialog.destroy();
							//														}
						});

					dialog.open();

				},




				onAfterRendering: function () {
					var oTable = this.getView().byId("tableReporting");
					oTable.addEventDelegate({
						onAfterRendering: function (oEvent) {
							var oBinding = oTable.getBinding("rows");
							if (undefined != oBinding) {
								oBinding.attachChange(this.onTableChange);
							}

						}.bind(this)
					});
				},
				/**
				 * Called when the View has been
				 * rendered (so its HTML is part of the
				 * document). Post-rendering
				 * manipulations of the HTML could be
				 * done here. This hook is the same one
				 * that SAPUI5 controls get after being
				 * rendered.
				 *
				 * @memberOf dtsdealerapp.dtsClaimsSearch
				 */


				/**
				 * Called when the Controller is
				 * destroyed. Use this one to free
				 * resources and finalize activities.
				 *
				 * @memberOf dtsdealerapp.dtsClaimsSearch
				 */
				// onExit: function() {
				//
				// }

				addLeadingZeroes: function (custnum) {
					var Kunnr = custnum;
					var length = custnum.length;
					var zerocnt = 10 - length;
					for (i = 0; i < zerocnt; i++) {
						Kunnr = "0".concat(Kunnr);
					}

					return Kunnr;
				},
				onSearchBtn: function () {
					var that = this;
					var oModel = that.getView().getModel("oGlobalModel");
					oModel.setProperty("/globalFilter", "");

					var oMatInp = that.getView().byId("idInptMaterial");
					var num1 = oMatInp.getValue();
					//oMatInp.setValueState(sap.ui.core.ValueState.None);
					//											
					// Validate Requirement Date
					var oReqDate = that.getView().byId("reqDate");
					oReqDate.setValueState(sap.ui.core.ValueState.None);
					if (oReqDate.getDateValue() == "") {
						oReqDate.setValueState(sap.ui.core.ValueState.Error);
						oReqDate.setValueStateText("Requirement Date is mandatory");
						return;
					}
					// validate Material Number
					if (oMatInp.getValue() == "") {
						oMatInp.setValueState(sap.ui.core.ValueState.Error);
						oMatInp.setValueStateText("Material is mandatory");
						// that.onUserMessage("Material is mandatory","E");

						//SHAIKD display Error message
						var sMatMessage = "Material is mandatory";
						var oVC = this.byId("idVerticalContent");
						oVC.destroyContent();
						var oMsgStrip1;
						var oMsgStrip1 = new MessageStrip({
									text: sMatMessage,
									type: "Error",
									showIcon: true
								});
						oVC.addContent(oMsgStrip1);

						return;
					}
					if (oMatInp.getValue().length > 18) {
						oMatInp.setValueState(sap.ui.core.ValueState.Error);
						oMatInp.setValueStateText("Enter a value with no more than 18 characters");
						return;
					}
					else {
						oMatInp.setValueState(sap.ui.core.ValueState.None);
						oMatInp.setValueStateText();
					}

					var reqDateMdl = oModel.getProperty("/ReqDate");
					var sRule = that.getView().byId("Rule").getSelectedKey();
					var valuType = that.getView().byId("idValuType").getSelectedKey();
					// call odata to get ATP Report.


					//var custnum1 = oModel.getProperty("/CustNum");		
					//var num = this.addLeadingZeroes(num1);
					//	userIDPortal ="KANSARAB";//"SPINELLL";
					//	reqDateMdl = '20120319'
					//	num1 = 'ARM277'
					// call odata method
					sap.ui.core.BusyIndicator.show();
					var oFilterVBwtar = new Filter({ path: "VBwtar", operator: FilterOperator.EQ, value1: valuType });
					var oFilterVDate  = new Filter({ path: "VDate", operator: FilterOperator.EQ, value1: reqDateMdl });
					var oFilterVMatnr = new Filter({ path: "VMatnr", operator: FilterOperator.EQ, value1: num1 });
					var oFilterVRule  = new Filter({ path: "VRule", operator: FilterOperator.EQ, value1: sRule });
					var oFilterVUserid = new Filter({ path: "VUserid", operator: FilterOperator.EQ, value1: userIDPortal });

					this.getView().getModel().read("/atpcheckSet", {
						filters: [oFilterVBwtar, oFilterVDate, oFilterVMatnr, oFilterVRule, oFilterVUserid],

						success: function (oData, response) {
							debugger;
							if (oData.results.length > 0) {								
								if(oData.results[0]!= null){
									//To display error message
									if(oData.results[0].VMatnr == ""){
										var errorMsg = "" + oData.results[0].Vmessage;
										var oVC1 = this.byId("idVerticalContent");
										oVC1.destroyContent();
										var oMsgStrip;
										var oMsgStrip = new MessageStrip({
													text: errorMsg,
													type: "Error",
													showIcon: true
												});
										oVC1.addContent(oMsgStrip);
									}	
								else{
									if(oData.results[0].VAlloc === "X"){
										//Display Warning Message -  SHAIKD
										var warningMsg = "" + oData.results[0].Vmessage;
										var oVC2 = this.byId("idVerticalContent");
										oVC2.destroyContent();
										var oMsgStrip;
										var oMsgStrip = new MessageStrip({
													text: warningMsg,
													type: "Information",
													showIcon: true
												});
										oVC2.addContent(oMsgStrip);
									}
									else{
									//Display success message
									var sMessage = oData.results.length + " record (s) found";
									var oVC = this.byId("idVerticalContent");
									oVC.destroyContent();
									var oMsgStrip;
									var oMsgStrip = new MessageStrip({
												text: sMessage,
												type: "Success",
												showIcon: true
											});
									oVC.addContent(oMsgStrip);
									}

								// populate the results on table
								var total = 0;
								for (var i = 0; i < oData.results.length; i++) {
									total = parseFloat(total) + parseFloat(oData.results[i].VAtp);
								}
								var oGlobMod = that.getView().getModel("oGlobalModel");
								//debugger;
								console.log("onSearchBtn()  Total Quantity 11 :  " + total);
								var displayTotal = that.formatter.quantityFormat(total);

								this.getView().byId("totquan").setNumber(displayTotal);
								var oModel = new sap.ui.model.json.JSONModel();

								oModel.setData(oData.results);
								//sap.ui.getCore().setModel(oModel,"openItems");
								if (oData.results.length > 11) {
									oGlobMod.setProperty("/Size", 11);
								}
								else {
									oGlobMod.setProperty("/Size", oData.results.length);
								}

								this.getView().setModel(oModel, "openItems");
							}
							}
							} else {

								// refresh table model with 0 records.	
								this.getView().getModel("oGlobalModel").setProperty("/Size", 0);
								var oModel = new sap.ui.model.json.JSONModel();
								var aData = [];
								oModel.setData(aData);
								this.getView().setModel(oModel, "openItems");
								this.getView().getModel("openItems").refresh();
								//
								console.log("SHAIKD Message 333  setNumber()  >> ")
								this.getView().byId("totquan").setNumber();
								// display no data message
								var oVC = this.byId("idVerticalContent");
								oVC.destroyContent();
								var oMsgStrip;
								var oMsgStrip = new MessageStrip({
									text: "No data found for the selection criteria",
									//text: "Warning: This material is on allocation / reserve. Inventory / Stocks shown may not be available for sale. Please check with your Demand Planner. ",
									type: "Information",
									showIcon: true
								});
								oVC.addContent(oMsgStrip);
							}

							sap.ui.core.BusyIndicator.hide();
						}.bind(this),

						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							this.onUserMessage(message, "E");
							result = "S";
						}.bind(this)
					});

				},
				dateFormUS: function (inDate) {
					var outDate = "";
					var month = parseInt(inDate.substring(5, 7));
					if (month < 10) {
						month = "0" + month;
					}
					var date = parseInt(inDate.substring(8, 10));
					if (date < 10) {
						date = "0" + date;
					}
					var year = fromDate.substring(0, 4);
					outDate = month + "/" + date + "/" + year;
					return outDate;
				},
				radioSelected: function (oEvent) {
					debugger;
					var oModelGlob = that.getView().getModel("oGlobalModel");
					var id = oEvent.getSource().getId().split("--")[1];
					if (id == "rd1") {
						oModelGlob.setProperty("/DatesVis", false);
						oModelGlob.setProperty("/pastXDVis", false);
					}
					else if (id == "rd2") {
						oModelGlob.setProperty("/DatesVis", false);
						oModelGlob.setProperty("/pastXDVis", true);
					}
					else if (id == "rd3") {
						oModelGlob.setProperty("/DatesVis", true);
						oModelGlob.setProperty("/pastXDVis", false);
					}
					debugger
				},
				onSort: function (oEvent) {
					//debugger;
					var oTable = that.getView().byId("tableReporting");
					var bDescending = false;
					var openItemsModel = that.getView().getModel("openItems");
					var oOrder = oEvent.mParameters.sortOrder;
					if (oOrder == "Ascending") {
						bDescending = false;
					}
					else {
						bDescending = true;
					}
					var sPath = "/" + oEvent.mParameters.column.mProperties.sortProperty;
					var oSorter = new Sorter(sPath, bDescending);
					var oTable = that.getView().byId("tableReporting");
					var aData = that.getView().getModel("openItems").getData();
					var index = aData.length - 1;
					openItemsModel.oData[index].Belnr = '';
					openItemsModel.oData[index].Ltext = '';
					openItemsModel.oData[index].Salesorder = '';

					if (sPath == '/Belnr') {
						if (bDescending) { openItemsModel.oData[index].Belnr = ''; }
						else { openItemsModel.oData[index].Belnr = '9999999999'; }
						// autoresize columns
					}

					else if (sPath == '/Ltext') {
						if (bDescending) { openItemsModel.oData[index].Ltext = ''; }
						else { openItemsModel.oData[index].Ltext = 'ZZZZZZZZZZ'; } oTable.autoResizeColumn(1);
					}

					else if (sPath == '/Salesorder') {
						if (bDescending) { openItemsModel.oData[index].Salesorder = ''; }
						else { openItemsModel.oData[index].Salesorder = '9999999999'; }
					}

					else if (sPath == '/Xblnr') {
						if (bDescending) { openItemsModel.oData[index].Xblnr = ''; }
						else { openItemsModel.oData[index].Xblnr = 'ZZZZZZZZZZ'; }
					}

					else if (sPath == '/Zuonr') {
						if (bDescending) { openItemsModel.oData[index].Zuonr = ''; }
						else { openItemsModel.oData[index].Zuonr = 'ZZZZZZZZZZ'; }
					}

					else if (sPath == '/Zfbdt') {
						if (bDescending) { openItemsModel.oData[index].Zfbdt = ''; }
						else { openItemsModel.oData[index].Zfbdt = '99991231'; }
					}

					else if (sPath == '/Zaldt') {
						if (bDescending) { openItemsModel.oData[index].Zaldt = ''; }
						else { openItemsModel.oData[index].Zaldt = '99991231'; }
					}

					var oBindings = oTable.getBinding("rows");
					oBindings.sort(oSorter, "Application");

				},
				belnrVis: function (Belnr) {
					debugger;
					if (Belnr == '9999999999') {
						return "tabColHide";
					}
					else {
						return "tabColVis";
					}
				},

				getModel: function (e) {

					return this.getOwnerComponent().getModel();

				},

				getOpenItemsZZZ: function () {
					/*
					var t = this;
					//var oModel = new sap.ui.model.json.JSONModel();

					//oModel.setData(null);

					var currDate = new Date();
					var oModel = that.getView().getModel("oGlobalModel");
					var custnum = oModel.getProperty("/CustNum");
					var compcode = this.getView().byId("compcode").getSelectedKey();
					var fromDate = "";
					var toDate = "";
					var fromDateMdl = "";
					var toDateMdl = ""

					var rd1Sel = that.getView().byId("rd1").getSelected();
					var rd2Sel = that.getView().byId("rd2").getSelected();
					var rd3Sel = that.getView().byId("rd3").getSelected();
					var flag = "O";
					if (rd2Sel == true) {
						var pastXDays = this.getView().byId("pastXDays").getSelectedKey();
						var today = new Date();
						var dateLimit = new Date(new Date().setDate(today.getDate() - parseInt(pastXDays)));
						that.getView().byId("idInspectionDateTo").setDateValue(today);
						that.getView().byId("idInspectionDateFrom").setDateValue(dateLimit);
						fromDateMdl = that.yyyymmdd1(dateLimit);
						toDateMdl = that.yyyymmdd1(today);
						flag = "";
					}
					else if (rd3Sel == true) {
						fromDateMdl = oModel.getProperty("/FromDate");
						//												var month = parseInt(fromDate.substring(5,7));
						//												fromDateMdl = fromDate.substring(0,4) + month + ""+ fromDate.substring(8,10);
						toDateMdl = oModel.getProperty("/ToDate");
						//												month = parseInt(toDate.substring(5,7));
						//												toDateMdl = toDate.substring(0,4) + month + ""+ toDate.substring(8,10);

						var oFromDate = that.getView().byId("idInspectionDateFrom");
						var oToDate = that.getView().byId("idInspectionDateTo");
						oFromDate.setValueState(sap.ui.core.ValueState.None);
						oToDate.setValueState(sap.ui.core.ValueState.None);
						if (oFromDate.getDateValue() == "") {
							oFromDate.setValueState(sap.ui.core.ValueState.Error);
							oFromDate.setValueStateText("From Date is required");
							return;
						}
						if (oToDate.getDateValue() == "") {
							oToDate.setValueState(sap.ui.core.ValueState.Error);
							oToDate.setValueStateText("To Date is required");
							return;
						}
						flag = "";
					}


					var vPath = "openItemsSet?$filter=(Bukrs eq '" + compcode + "' and IvDateFrom eq '" + fromDateMdl + "' and " +
						"IvDateTo eq '" + toDateMdl + "' and IvFlag eq '" + flag + "' and Kunnr eq '" + custnum + "')";

					// call odata method
					sap.ui.core.BusyIndicator.show();
					this.getModel.read(vPath, {
						async: true, success: function (oData) {

							if (oData.results.length > 0) {
								//																if(oData.results[0].Return.Type == "E")
								//																	{
								//																	t.onUserMessage(oData.results[0].Return.Message,"E");
								//																	}
								//																else
								//																	{
								// populate the results on table
								var totOpen = 0;
								var totClear = 0;

								var oGlobMod = that.getView().getModel("oGlobalModel");
								oGlobMod.setProperty("/TotalOpen", totOpen);
								oGlobMod.setProperty("/TotalCleared", totClear);
								for (var i = 0; i < oData.results.length; i++) {
									if (oData.results[i].Type == "O") {
										totOpen = totOpen + parseFloat(oData.results[i].Wrbtr);
									}
									else if (oData.results[i].Type == "C") {
										totClear = totClear + parseFloat(oData.results[i].Wrbtr);
									}
								}
								var oModel = new sap.ui.model.json.JSONModel();
								// append the totals row(s) to the oData.results.
								if (rd1Sel == true) {

									oData.results.push({
										"Kunnr": "",
										"Belnr": "",
										"Bschl": "",
										"Xblnr": "",
										"Zuonr": "",
										"Zfbdt": "",
										"Salesorder": "",
										"Zaldt": "",
										"Zterm": "",
										"Wrbtr": totOpen,
										"Verz1": "",
										"Rstgr": "",
										"Esrnr": "",
										"Ltext": "",
										"ZtermText": "Total Open",
										"Vbtyp": "",
										"Kschl": "",
										"KschlText": "",
										"FormFound": "",
										"Type": "TO",
										"Bukrs": "",
										"IvDateFrom": "",
										"IvDateTo": "",
										"IvFlag": ""
									});
								}

								else {

									oData.results.push({
										"Kunnr": "",
										"Belnr": "",
										"Bschl": "",
										"Xblnr": "",
										"Zuonr": "",
										"Zfbdt": "",
										"Salesorder": "",
										"Zaldt": "",
										"Zterm": "",
										"Wrbtr": totOpen,
										"Verz1": "",
										"Rstgr": "",
										"Esrnr": "",
										"Ltext": "",
										"ZtermText": "Total Open",
										"Vbtyp": "",
										"Kschl": "",
										"KschlText": "",
										"FormFound": "",
										"Type": "TO",
										"Bukrs": "",
										"IvDateFrom": "",
										"IvDateTo": "",
										"IvFlag": ""
									});

									oData.results.push({
										"Kunnr": "",
										"Belnr": "",
										"Bschl": "",
										"Xblnr": "",
										"Zuonr": "",
										"Zfbdt": "",
										"Salesorder": "",
										"Zaldt": "",
										"Zterm": "",
										"Wrbtr": totClear,
										"Verz1": "",
										"Rstgr": "",
										"Esrnr": "",
										"Ltext": "",
										"ZtermText": "Total Cleared",
										"Vbtyp": "",
										"Kschl": "",
										"KschlText": "",
										"FormFound": "",
										"Type": "TC",
										"Bukrs": "",
										"IvDateFrom": "",
										"IvDateTo": "",
										"IvFlag": ""
									});


								}

								oModel.setData(oData.results);
								//sap.ui.getCore().setModel(oModel,"openItems");
								if (oData.results.length > 11) {
									oGlobMod.setProperty("/Size", 11);
								}
								else {
									oGlobMod.setProperty("/Size", oData.results.length);
								}

								that.getView().setModel(oModel, "openItems");

								oGlobMod.setProperty("/TotOpenVis", false);
								oGlobMod.setProperty("/TotClearVis", false);

								oGlobMod.setProperty("/TotalOpen", that.currFormatC(totOpen) + " " + oGlobMod.getProperty("/Currency"));
								oGlobMod.setProperty("/TotalCleared", that.currFormatC(totClear) + " " + oGlobMod.getProperty("/Currency"));

								//																	// autoresize columns
								//																	var oTable = that.getView().byId("tableReporting");
								//																	for(var i = 0; i < oTable.getColumns().length; i++ ) {
								//																		oTable.autoResizeColumn(i);
								//																	 }



								//																	}
							} else {
								console.log("No Data", oData);
								that.getView().getModel("oGlobalModel").setProperty("/Size", 0);
							}
						},
						error: function (
							oError) {
							var data = JSON.stringify(oError);
							var message = $(oError.response.body).find("message").first().text();
							t.onUserMessage(message, "E");
							result = "S";

						}
					});
					sap.ui.core.BusyIndicator.hide();
					//return userID;
					*/
				},
				totDesign: function (text) {
					if ("Total Open" == text || "Total Cleared" == text) {
						return "Bold";
					}
					else {
						return "Standard";
					}
				},

				onTableChange: function (oEvent) {
					var iLength = oEvent.getSource().iLength;
					var oLocalModel = oView.getModel("oGlobalModel");
					var total = 0;
					if (iLength > 10) {
						oLocalModel.setProperty("/Size", 10);
					}
					else {
						oLocalModel.setProperty("/Size", iLength);
					}

					var OpenItems = oView.getModel("openItems").getData();
					var aFiltered = [];
					for (var i = 0; i < oEvent.getSource().aIndices.length; i++) {
						aFiltered.push(OpenItems[oEvent.getSource().aIndices[i]]);
					}
					for (var i = 0; i < aFiltered.length; i++) {
						total = total + parseFloat(aFiltered[i].VAtp);
					}
					debugger;
					console.log("onTableChange() Total22  " + total)
					oView.byId("totquan").setNumber(total);
				},



				invoice: function (oEvent) {
					debugger;
					var target = oEvent.getSource().getTarget();
					var Kschl = target.split("|")[0];
					var Belnr = target.split("|")[1];
					var Vbtyp = target.split("|")[2];
					var url = href = "/sap/opu/odata/sap/ZACNTSUMMARY_SRV/pdfSet(ConditionType='" + Kschl + "',DocumentNumber='" + Belnr + "',DocumentType='" + Vbtyp + "')/$value";
					window.open(url, Belnr);
					debugger;
				},
				linkTarget: function (Kschl, Belnr, Vbtyp) {
					return Kschl + "|" + Belnr + "|" + Vbtyp;
				},
				pdfExists: function (formfound) {
					if (null == formfound) {
						formfound = "";
						return false;
					}
					else if (formfound == "X") {
						return true;
					}
					else {
						return false;
					}
				},
				filterStd: function (oEvent) {
					var oItems = null;
					var oTable = null;
					var sType = "";
					var oBindings = null;

					var totOpen, totClear, Wrbtr, iLength;

					oTable = oView.byId("tableReporting");
					oBindings = oTable.getBinding('rows');
					oBindings.attachChange(function (oEvent) {
						iLength = oEvent.getSource().iLength;
						oTable = oView.byId("tableReporting");
						oItems = oTable.getRows();
					});
				},
				onFilter: function (oEvent) {
					var that = this;
					var oTable = that.getView().byId("tableReporting");
					var oBindings = oTable.getBinding("rows");
					var sQuery = oEvent.getParameter("query").toString();
					var oFilter = null;

					if (sQuery) {
						oFilter = new Filter([
							new Filter("Werks", FilterOperator.Contains, sQuery),
							new Filter("Name", FilterOperator.Contains, sQuery),
							new Filter("VDate", FilterOperator.Contains, sQuery),
							new Filter("VDate", FilterOperator.Contains, "Total Quantity"),
							//new Filter("VAtp", FilterOperator.Contains, sQuery)
						], false);
					}
					oBindings.filter(oFilter, "Application");
				},
				sumAmount: function (amount) {

					total = total + amount;
					return total;
					alert(total);
				},

				onDatesInitClaims: function () {
					var that = this;
					var oView = this.getView();

					// this.getViewbyId("onClaimsDateTo").setDateValue(new
					// Date());

					oView.byId("idInspectionDateTo")
						.setDateValue(new Date());

					var today = new Date();
					var dateLimit = new Date(
						new Date().setDate(today
							.getDate() - 90));

					oView.byId("idInspectionDateFrom")
						.setDateValue(dateLimit);

					this.isClaimsDateFrom = this
						.yyyymmdd(dateLimit);

					this.isClaimsDateTo = this
						.yyyymmdd(today);

					//this.onLoadInitClaims();

				},

				onClaimsDateFrom: function (oEvent) {
					var that = this;
					var oSource = oEvent.getSource();
					var oNewDate = oSource
						.getDateValue();
					this.isClaimsDateFrom = this
						.yyyymmdd(oNewDate);
					console.log("onClaimsDateFrom:",
						this.isClaimsDateFrom);
				},

				onClaimsDateTo: function (oEvent) {
					var that = this;
					var oSource = oEvent.getSource();
					var oNewDate = oSource
						.getDateValue();
					this.isClaimsDateTo = this
						.yyyymmdd(oNewDate);
					console.log("onClaimsDateTo:",
						this.isClaimsDateTo);
				},

				yyyymmdd: function (oNewDate) {
					var now = oNewDate;
					var y = now.getFullYear();
					var m = now.getMonth() + 1;
					var d = now.getDate();
					
					return '' + (m < 10 ? '0' : '')
						+ m + (d < 10 ? '/0' : '/')
						+ d + "/" + y;
				},
				yyyymmdd1: function (oNewDate) {
					var now = oNewDate;
					var y = now.getFullYear();
					var m = now.getMonth() + 1;
					var d = now.getDate();
					return '' + y + (m < 10 ? '0' : '')
						+ m + (d < 10 ? '0' : '')
						+ d;


				},
				
				dateFormatforExcelZZZ: function (date) {
					if (null != date && "" != date && "Total Quantity" != date) {
						var d = date.substring(6, 8);
						var m = date.substring(4, 6);
						var y = date.substring(0, 4);
						date = m + "/" + d + "/" + y;
						if (date != "12/31/9999") {
							return date;
						}
						//return m + "/" + d + "/" + y;	
					}
					else {
						return date;
					}

				},
				
				totDesign: function (text) {
					if ("Total Quantity" == text) {
						return "Bold";
					}
					else {
						return "Standard";
					}
				},
				currFormatO: function (curr, status) {
					if (null == status) {
						status = "";
					}

					if (null != curr) {
						if ("O" == status || "TO" == status) {
							return "Warning"
						}
						else if ("C" == status || "TC" == status) {
							return "Success";
						}
					}

				},

				currFormatC: function (curr, status) {

					if (null != curr) {
						var oCurrencyFormat = NumberFormat.getCurrencyInstance();
						return oCurrencyFormat.format(curr, "");
					}

				},
				removeLeading: function (number) {
					//var oControl = this.getId();
					this;

					if (null != number) {
						number = number.replace(/^0+/, '');
					}

					if (number == '9999999999' || number == 'ZZZZZZZZZZ') {
						//	this.addStyleClass('green');
					}
					else {
						return number;
					}
				},
				statusFormat: function (status) {

					if ("O" == status) {
						return "Open";
					}
					else if ("C" == status) {
						return "Closed";
					}
					else if ("TO" == status || "TC" == status) {
						return "";
					}

				},
				onUserMessage: function (uText, mType) {
					if (mType == 'E') {

						var oModel = new sap.ui.model.json.JSONModel();
						sap.ui.getCore().setModel(
							oModel);
						sap.ui.getCore().getModel()
							.setProperty("/oFlag",
								true);
						var oFlag = sap.ui.getCore()
							.getModel()
							.getProperty("/oFlag");
						sap.m.MessageToast
							.show(
								uText,
								{
									duration: 60000,
									my: "center center",
									at: "center center"
								});
						this.onShowColor(oFlag,
							'#ff0000');
					} else {

						var oModel = new sap.ui.model.json.JSONModel();
						sap.ui.getCore().setModel(
							oModel);
						sap.ui.getCore().getModel()
							.setProperty("/oFlag",
								true);
						var oFlag = sap.ui.getCore()
							.getModel()
							.getProperty("/oFlag");
						sap.m.MessageToast
							.show(
								uText,
								{
									duration: 60000,
									my: "center center",
									at: "center center"
								});
						this.onShowColor(oFlag,
							'#008000');
					}
				},

				onLoadProgramTypes: function () { },

				onClearMessage: function () {
					var that = this;
					var oView = this.getView();
					var oText = oView
						.byId("MessageText");
					oText.setText("-");
					oText.setVisible(false);

					// Button setVisible(false)
					var oText = oView
						.byId("MessageButton");
					oText.setVisible(false);

				},

				onShowColor: function (Flag, color) {
					var oContentDOM = $('#content'); // Pass
					// div
					// Content
					// ID
					var oParent = $('#content')
						.parent(); // Get Parent
					// Find for MessageToast class
					var oMessageToastDOM = $('#content')
						.parent()
						.find('.sapMMessageToast');
					oMessageToastDOM.css('background',
						color); // Apply css
					sap.ui.getCore().getModel()
						.setProperty("/oFlag",
							!Flag);
				},

				hideBusyIndicator: function () {
					sap.ui.core.BusyIndicator.hide();
				},

				showBusyIndicator: function (iDuration,
					iDelay) {
					// sap.ui.core.BusyIndicator.show(iDelay);

					var oBusyDialog = new sap.m.BusyDialog();

					oBusyDialog.open();

					jQuery.sap.delayedCall(iDuration,
						this, function () {
							oBusyDialog.close();
						});

				},
				//Start...   &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//
				onExcelExportPOC: function (oEvent) {
					//if (!this._oTable) {
					//	this._oTable = this.byId("tableReporting");
					//}
					debugger;
					var that = this;
					const oTable = this.getView().byId("tableReporting");					
					//const oRowBinding = oTable.getBinding("items");
					const oRowBinding = this.getView().getModel("openItems").getData();
					//this.getView().getModel("TableData").getData().results.rowData;
					var aData = [{
						"Name": "Warehouse",
						"VAlloc": "",
						"VAtp": "Available Quantity",
						"VBwtar": "",
						"VDate": "Requirement Date",
						"VMaktx": "",
						"VMatnr": "",
						"VRule": "",
						"VUserid": "",
						"VVkorg": "",
						"Werks": "Plant"
					},
					{
						"Name": "Warehouse 11",
						"VAlloc": "",
						"VAtp": "Available Quantity 11",
						"VBwtar": "",
						"VDate": "Requirement Date 11",
						"VMaktx": "",
						"VMatnr": "",
						"VRule": "",
						"VUserid": "",
						"VVkorg": "",
						"Werks": "Plant 11"
					}		
				
				];
					const aCols = this.createExcelColumnConfig();
					const oSettings = {
						workbook: {
							columns: aCols,
							hierarchyLevel: "Level"
						},
						dataSource: oRowBinding,
						fileName: "Table export sample11.xlsx",
						worker: true // We need to disable worker because we are using a MockServer as OData Service
					};

					const oSheet = new Spreadsheet(oSettings);
					oSheet.build().finally(function () {
						oSheet.destroy();
					});
				},

				createExcelColumnConfig: function () {
					const aCols = [];

					aCols.push({
						label: "Plant",
						type: EdmType.String,
						property: "Werks",

					});
					aCols.push({
						label: "Ware House",
						type: EdmType.String,
						property: "Name"

					});
					aCols.push({
						label: "Requirement Date",
						type: EdmType.String,
						property: "VDate",

					});
					aCols.push({
						label: "Available Quantity",
						type: EdmType.String,
						property: "VAtp",
						//property: "{ path: 'openItems>VAtp', formatter: '.formatter.quantityFormat'}",

					});
					return aCols;
				},
				//End...   &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//

				onDataExport: function (oEvent) {
					var that = this;
					debugger;
					var openItems = that.getView().getModel("openItems");
					var aDataCopy = JSON.parse(JSON.stringify(openItems.getData()));
					var modelExcel = new sap.ui.model.json.JSONModel(aDataCopy);
			
					console.log("modelExcel : /n", modelExcel);

					//openItems.getData()[0].VDate = "12/30/1921";
					var modLength = modelExcel.getData().length;	
					
					for (var i = 0; i < modLength; i++){
						//var dataObject = {};
						var dateVal = modelExcel.getData()[i].VDate;
						var quanVal = modelExcel.getData()[i].VAtp;
					
						modelExcel.getData()[i].VDate = this.formatter.dateFormat(dateVal).toString();
						modelExcel.getData()[i].VAtp = this.formatter.quantityFormat(quanVal).toString();	
						
					}
					
					debugger;
					var oExport = new Export({
						// Type that will be used to generate the content.
						// Own ExportType's can be created to support other
						// formats
						exportType: new ExportTypeCSV({
							separatorChar: ","
						}),

						// Pass in the model created above
						models: modelExcel,

						// binding information for the rows aggregation
						rows: {
							path: "/"
						},

						// column definitions with column name and binding info for the content
						columns: [{
							name: "Plant",
							template: { content: "{Werks}"   }
						},
						{
							name: "Warehouse",
							template: {
								content: "{Name}"
							}
						},
						{
							name: "Requirement Date",
							template: {								
								//content: a1
								//content: "{ path: 'VDate', formatter: '.formatter.dateFormat'}"
								content: "{VDate}"
							}
						},
						{
							name: "Available Quantity",
							template: { 
								//content: b1
								 content: "{VAtp}"
							}
						}
						]
					});

					var newDate = new Date();
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "yyyyMMdd"
					});
					var subFromDate = oDateFormat.format(newDate);
					var oTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "HHmmss"
					});
					var subFromTime = oTimeFormat.format(newDate);

					var fileName = "ATP_" + subFromDate + "_" + subFromTime;
					console.log(newDate, subFromDate, subFromTime, fileName);
					console.log(oExport);
					oExport.saveFile(fileName).catch(function (oError) {
						MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
					}).then(function () {
						oExport.destroy();
					});
				}

			});
		}
	);