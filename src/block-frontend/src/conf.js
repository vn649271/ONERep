const deploy_mode = 2; // 0: localhost, 1: publish on host, 2: publish on dedicated server
module.exports = {
	SERVER_URL: deploy_mode === 0 ? 
					"http://localhost:3001" :
					( deploy_mode === 1 ? 
						"https://4557-116-202-24-219.ngrok.io":
						// "https://52.221.179.43:3001" 
						"https://188b-2406-da18-680-dd00-7124-9eb0-aad3-d784.ngrok.io"
					)
};
