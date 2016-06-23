/**
* Copyright 2016 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var Messages = {
    // Add here your messages for the default language.
    // Generate a similar file with a language suffix containing the translated messages.
    // key1 : message1,
};

var wlInitOptions = {
    // Options to initialize with the WL.Client object.
    // For initialization options please refer to IBM MobileFirst Platform Foundation Knowledge Center.
};

var displayName;

// Called automatically after MFP framework initialization by WL.Client.init(wlInitOptions).
function wlCommonInit(){
    document.getElementById("getPublicData").addEventListener("click", getPublicData);
    document.getElementById("getBalance").addEventListener("click", getBalance);
    document.getElementById("getTransactions").addEventListener("click", getTransactions);
    document.getElementById("enrollButton").addEventListener("click", enroll);
    document.getElementById("unenrollButton").addEventListener("click", unenroll);

    var userLoginChallengeHandler = UserLoginChallengeHandler();
    var pinCodeChallengeHandler  = PinCodeChallengeHandler();
    var isEnrolledChallengeHandler  = IsEnrolledChallengeHandler();
    
    isEnrolled();
}

function getPublicData() {
    var resourceRequest = new WLResourceRequest(
        "/adapters/ResourceAdapter/publicData",
        WLResourceRequest.GET
    );

    resourceRequest.send().then(
        function(response) {
            document.getElementById("responseTextarea").value = response.responseText;
        },
        function(response) {
            WL.Logger.debug("Error writing public data: " + JSON.stringify(response));
        }
    );    
}

function getBalance() {
    var resourceRequest = new WLResourceRequest(
        "/adapters/ResourceAdapter/balance",
        WLResourceRequest.GET
    );

    resourceRequest.send().then(
        function(response) {
            document.getElementById("responseTextarea").value = response.responseText;
        },
        function(response) {
            WL.Logger.debug("Error writing balance: " + JSON.stringify(response));
        }
    );    
}

function getTransactions() {
    var resourceRequest = new WLResourceRequest(
        "/adapters/ResourceAdapter/transactions",
        WLResourceRequest.GET
    );

    resourceRequest.send().then(
        function(response) {
            document.getElementById("responseTextarea").value = response.responseText;
        },
        function(response) {
            WL.Logger.debug("Error writing transactions: " + JSON.stringify(response));
        }
    );    
}

function isEnrolled() {
    WLAuthorizationManager.obtainAccessToken("IsEnrolled").then(
        function() {
            document.getElementById("wrapper").style.display = 'block';
            document.getElementById("getBalance").style.display = 'inline-block';
            document.getElementById("getTransactions").style.display = 'inline-block';
            document.getElementById("unenrollButton").style.display = 'block';
            document.getElementById("helloUser").innerHTML = "Hello, " + displayName;
        },
        function(response) {
            document.getElementById("wrapper").style.display = 'block';
            document.getElementById("unenrollButton").style.display = 'none';
            document.getElementById("headerTitle").style.marginLeft = '79px';
            document.getElementById("enrollButton").style.display = 'block';
            WL.Logger.debug("Error while checking for enrollment status: " + JSON.stringify(response));
            
        }
    );  
}

function enroll() {
    var pinCode = "";
    document.getElementById("enrollButton").style.display = 'none';
    WLAuthorizationManager.obtainAccessToken("setPinCode").then(
        function() {       
            pinCode = prompt("Set a pin code", "");
            while (pinCode === "") {
                pinCode = prompt("You must set a pin code", "");
            }
            
            if (pinCode === null) {
                WLAuthorizationManager.logout("EnrollmentUserLogin").then(
                function() {
                    WL.Logger.debug("Successfully logged out from EnrollmentUserLogin.");
                    document.getElementById('username').value = "";
                    document.getElementById('password').value = "";
                    document.getElementById('responseTextarea').value = "";
                    document.getElementById("loginDiv").style.display = 'none';
                    document.getElementById("appDiv").style.display = 'block';
                    document.getElementById("enrollButton").style.display = 'block';
                    document.getElementById("helloUser").innerHTML = "Hello, Guest";
                    document.getElementById("getTransactions").style.display = 'none';
                    document.getElementById("getBalance").style.display = 'none';
                },
                function(response) {
                    WL.Logger.debug("Failed logging out from EnrollmentUserLogin: " + JSON.stringify(response));
                }
                );
            } else {
                var resourceRequest = new WLResourceRequest(
                    "/adapters/Enrollment/setPinCode/" + pinCode,
                    WLResourceRequest.POST
                );
                
                resourceRequest.send().then(
                    function() {
                        document.getElementById("loginDiv").style.display = 'none';
                        document.getElementById("appDiv").style.display = 'block';
                        document.getElementById("getBalance").style.display = 'inline-block';
                        document.getElementById("getTransactions").style.display = 'inline-block';
                        document.getElementById("enrollButton").style.display = 'none';
                        document.getElementById("unenrollButton").style.display = 'block';
                        document.getElementById("helloUser").innerHTML = "Hello, " + displayName;
                    },
                    function(response) {
                        WL.Logger.debug("Error writing public data: " + JSON.stringify(response));
                    }
                );
            }
        },
        function (response) {
            WL.Logger.debug("Failed requesting an access token:" + JSON.stringify(response));
        }
    );
}

function unenroll() {
    var resourceRequest = new WLResourceRequest(
        "/adapters/Enrollment/unenroll",
        WLResourceRequest.DELETE
    );
    
    resourceRequest.send().then(
        function() {
            WL.Logger.debug ("Successfully deleted the pin code.");
            logout();
        },
        function(response) {
            WL.Logger.debug("Failed deleting pin code: " + JSON.stringify(response));
        }
    );
}

function logout() {
    WLAuthorizationManager.logout("EnrollmentUserLogin").then(
        function() {
            WL.Logger.debug ("Successfully logged-out from EnrollmentUserLogin.");
            WLAuthorizationManager.logout("EnrollmentPinCode").then(
                function() {
                    WL.Logger.debug("Successfully logged-out from EnrollmentPinCode.");
                    WLAuthorizationManager.logout("IsEnrolled").then(
                        function() {
                            WL.Logger.debug ("Successfully logged-out from IsEnrolled.");
                            document.getElementById('username').value = "";
                            document.getElementById('password').value = "";
                            document.getElementById('responseTextarea').value = "";
                            document.getElementById("getBalance").style.display = 'none';
                            document.getElementById("getTransactions").style.display = 'none';
                            document.getElementById("enrollButton").style.display = 'block';
                            document.getElementById("unenrollButton").style.display = 'none';
                            document.getElementById("helloUser").innerHTML = 'Hello, Guest';
                        },
                        function(response) {
                            WL.Logger.debug("isEnrolled logout failed: " + JSON.stringify(response));
                        }
                    );
                },
                function(response) {
                    WL.Logger.debug("EnrollmentPinCode logout failed: " + JSON.stringify(response));
                }
            );
        },
        function(response) {
            WL.Logger.debug("EnrollmentUserLogin logout failed: " + JSON.stringify(response));
        }
    );
}
