const deploy_mode = 2; // 0: localhost, 1: publish on host, 2: publish on dedicated server
module.exports = {
	SERVER_URL: deploy_mode === 0 ? 
					"http://localhost:3001" :
					( deploy_mode === 1 ? 
						"https://2b16-116-202-24-219.ngrok.io":
						"https://172.26.9.21:3001" )
};
