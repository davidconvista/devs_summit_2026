sap.ui.define([], () => {
	"use strict";

	return {
		statusIcon(iStatus){
			switch (iStatus) {
				case 0:
					return "sap-icon://message-information";
				case 1:
					return "sap-icon://message-error";
				case 2:
					return "sap-icon://message-warning";
				case 3:
					return "sap-icon://message-success";
				default:
					return "";
			}
		},

		statusIconColor(iStatus){
			switch (iStatus) {
				case 0:
					return "Neutral";
				case 1:
					return "Negative";
				case 2:
					return "Critical";
				case 3:
					return "Positive";
				default:
					return "";
			}
		},

        formatMessageType(sType){
            switch(sType){
                case "S":
                    return "Success";
                case "E":
                    return "Error";
                case "W":
                    return "Warning";
                case "I":
                    return "Information";
                default:
                    return "None";
            }
        }
	};
});