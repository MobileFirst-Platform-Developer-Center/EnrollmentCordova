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
var UserLoginChallengeHandler = function() {
    var isChallenged = false;
    var securityCheckName = 'EnrollmentUserLogin';
    var userLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(securityCheckName);
    
    document.getElementById("loginButton").addEventListener("click", login);
    
    userLoginChallengeHandler.securityCheckName = securityCheckName;
    userLoginChallengeHandler.handleChallenge = function(challenge) {
        WL.Logger.debug("handleChallenge");
        document.getElementById("appDiv").style.display = 'none';
        document.getElementById("loginDiv").style.display = 'block';

        isChallenged = true;
        var statusMsg = "";
        if (challenge.errorMsg !== null){
            statusMsg = statusMsg + "<br/>" + challenge.errorMsg;
        }
        document.getElementById("statusMsg").innerHTML = statusMsg;
    };

    userLoginChallengeHandler.handleSuccess = function(response) {
        displayName = response.user.displayName;
        WL.Logger.debug("processSuccess");
        isChallenged = false;
    };

    userLoginChallengeHandler.handleFailure = function(error) {
        WL.Logger.debug("handleFailure: " + error.failure);
        isChallenged = false;
        if (error.failure !== null){
            alert(error.failure);
        } else {
            alert("Failed to login.");
        }
    };

    function login() {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if (username === "" || password === ""){
            alert("Username and password are required");
            return;
        }
        if (isChallenged){
            userLoginChallengeHandler.submitChallengeAnswer({'username':username, 'password':password});
        } else {
            WLAuthorizationManager.login(securityCheckName,{'username':username, 'password':password}).then(
                function() {
                    WL.Logger.debug("login onSuccess");
                },
                function(response) {
                    WL.Logger.debug("login onFailure: " + JSON.stringify(response));
                });
        }
    }

    return userLoginChallengeHandler;
};
