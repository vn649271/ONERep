const deploy_mode = 2; // 0: localhost, 1: publish on host, 2: publish on dedicated server
const dev_mode = true;

module.exports = {
	SERVER_URL: deploy_mode === 0 ? 
					"http://localhost:3001" :
					// "https://localhost:3001" :
					( deploy_mode === 1 ? 
						"https://4557-116-202-24-219.ngrok.io":
						// "http://52.221.179.43:3001" 
						//"https://52.221.179.43:3001" 
						// "https://52.221.179.43:3001" 
						"https://onerep.uniblocks.net:3001"
					),
	CHAIN_NAME: dev_mode ? "Harmony DevNet" : "Harmony",
	CHAIN_ID: dev_mode ? 1666900000: 1666600000,
    BLOCK_EXPLORER_URLS: dev_mode ? ["https://explorer.ps.hmny.io/"] : ["https://explorer.harmony.one/"],
    RPC_URLS: dev_mode ? ["https://api.s0.ps.hmny.io"] : ["https://api.harmony.one"],
};
