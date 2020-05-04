from flask import Flask, request
import json
import codecs
import requests
import random
from requests.auth import HTTPBasicAuth
from bs4 import BeautifulSoup

# Your baseUrl
baseUrl = "http://pdcesx01201.exnet.sas.com"

# Auth code - get it in your CAS controller
# you can get it by running this command:
# cat /opt/sas/viya/config/etc/SASSecurityCertificateFramework/tokens/consul/default/client.token
consul = '3883d86d-3896-4c0b-835a-681b36b613f3';

# Saved Project 
# Replace it with the same model name you published to MAS
savedProject = 'bcflow'

app = Flask(__name__)



def auth():

	urlToken1 = baseUrl + "/SASLogon/oauth/clients/consul?callback=false&serviceId=app"
	tokenFinal = ''
	headers = {
	    "X-Consul-Token": consul
	}

	try:
		firstToken = requests.post(urlToken1, headers=headers).json()["access_token"]
	except requests.exceptions.RequestException as e: 
	    print(e)

	
	urlToken2 = baseUrl + "/SASLogon/oauth/clients"

	headers2 = {
	    "Content-Type" : "application/json",
	    "Authorization": "Bearer " + firstToken
	}

	body = {"client_id": "usuario_oath", "client_secret": "Orion123", "scope": ["openid", "*"], "resource_ids": "none", "authorities": ["uaa.none"], "authorized_grant_types": ["password"],"access_token_validity": 36000}

	try:
		secToken = requests.post(urlToken2, data = json.dumps(body), headers=headers2)
	except requests.exceptions.RequestException as e: 
	    print(e)

	urlToken3 = baseUrl + "/SASLogon/oauth/token?grant_type=password&username=sasdemo&password=Orion123"

	headers3 = {
	    "Content-Type" : "application/x-www-form-urlencoded",
	    "Accept": "application/json"
	}

	try:
		tokenFinal = requests.get(urlToken3, headers=headers3, auth=HTTPBasicAuth('usuario_oath', 'Orion123')).json()["access_token"]
	except requests.exceptions.RequestException as e: 
	    print(e)

	return tokenFinal

@app.route('/', methods=['POST'])
def main():

	if request.method == 'POST':
		tokenFinal = auth()
		url = baseUrl + '/microanalyticScore/modules/'+ savedProject +'/steps/execute'
		
		dt = request.json
		
		payload = {'inputs':[{'name':'Postal_Code_','value': dt["Postal_Code_"]}],
		'version':2}
		print(payload)
	
		headers = {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + tokenFinal}
		
		r = requests.post(url, data=json.dumps(payload), headers=headers).json()

		print(r["outputs"])

		return str(r["outputs"][0]['value'])

	else:
		return "Incorrect API configuration"

if __name__ == '__main__':
	main()
