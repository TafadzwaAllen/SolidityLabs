<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My NFT APP</title>
</head>
<body>
    <h1>My NFT Collection</h1>
    <div>
        <p>Your Ethereum Wallet Address:</p>
        <p id="walletAddress">Not connected</p>
    </div>
    <button id="connectButton">Connect to Your Wallet</button>
    
    <!-- Input fields for recipient address and metadata URL -->
    <div>
        <label for="recipientAddress">Recipient Ethereum Address:</label>
        <input type="text" id="recipientAddress" placeholder="Enter recipient address">
    </div>
    <div>
        <label for="metadataURL">Metadata URL:</label>
        <input type="text" id="metadataURL" placeholder="Enter metadata URL">
    </div>

    <button id="mintButton">Mint an NFT</button>
    <div>
        <h2>Your NFT Collection:</h2>
        <ul id="nftList">
            <!-- NFTs will be displayed here -->
        </ul>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/web3@1.6.0/dist/web3.min.js"></script>
    <script>
        // Define essential variables outside the event listener
        let web3;
        let nftContract;

        window.addEventListener('load', async () => {
            if (window.ethereum) {
                web3 = new Web3(window.ethereum);

                // Listen for changes in the selected address
                window.ethereum.on('accountsChanged', (accounts) => {
                    const walletAddress = accounts[0];
                    document.getElementById('walletAddress').textContent = walletAddress;

                    // Reload and display NFTs when the address changes
                    loadNFTs(walletAddress);
                });

                // Connect to the wallet when the button is clicked
                const connectButton = document.getElementById('connectButton');
                connectButton.addEventListener('click', async () => {
                    try {
                        // Request access to the user's Ethereum wallet
                        await window.ethereum.request({ method: 'eth_requestAccounts' });

                        // Get the selected address and display it
                        const walletAddress = window.ethereum.selectedAddress;
                        document.getElementById('walletAddress').textContent = walletAddress;

                        // Load and display NFTs
                        await loadNFTs(walletAddress);
                    } catch (error) {
                        console.error('Error connecting to Ethereum wallet:', error);
                    }
                });

                const mintButton = document.getElementById('mintButton');
                mintButton.addEventListener('click', async () => {
                    try {
                        // Request access to the user's Ethereum wallet
                        await window.ethereum.request({ method: 'eth_requestAccounts' });
                        
                        // Retrieve recipient address and metadata URL from user input
                        const recipientAddress = document.getElementById('recipientAddress').value;
                        const mdUrl = document.getElementById('metadataURL').value;
                        const metadata = "ipfs://" + mdUrl;
                        
                        // Check if the user is connected to Ethereum
                        if (!web3.eth.defaultAccount) {
                            throw new Error('Ethereum wallet not connected or no default account selected.');
                        }

                        // Specify the 'from' address for the transaction
                        const fromAddress =  window.ethereum.selectedAddress;
                        
                        const gas = 200000; // Adjust gas limit as needed

                        // Call the mint function
                        const result = await nftContract.methods
                            .safeMint(recipientAddress, metadata)
                            .send({ from: window.ethereum.selectedAddress, gas });

                        console.log('Minting successful:', result);
                    } catch (error) {
                        console.error('Minting error:', error);
                    }
                });

            } else {
                console.error('Ethereum wallet (MetaMask) is not installed.');
                document.getElementById('walletAddress').textContent = 'Ethereum wallet not detected';
            }
        });

        // Function to load and display NFTs
        async function loadNFTs(walletAddress) {
            // Replace with the address of the ERC-721 NFT contract
            const nftContractAddress = '0xYourContractAddressHere'; // Replace with your contract address

            // Initialize the contract instance
            const nftabi = [
                // ... (contract ABI)
            ];

            nftContract = new web3.eth.Contract(nftabi, nftContractAddress);

            // Start from tokenId 0 and keep incrementing until a non-existent token is found
            let tokenId = 0;
            const nftList = document.getElementById('nftList');
            nftList.innerHTML = '';

            while (true) {
                try {
                    // Attempt to fetch metadata for the current tokenId
                    const tokenURI = await nftContract.methods.tokenURI(tokenId).call();
                    const tokenurl = "https://example.com/ipfs/" + tokenURI.replace("ipfs://","");
                    const metadata = await fetchNFTMetadata(tokenurl);

                    // Create and append the NFT item to the list
                    const nftItem = document.createElement('li');
                    nftItem.innerHTML = `
                        <h3>${metadata.name}</h3>
                        <p>${metadata.description}</p>
                        <img src="${metadata.imgUrl}" alt="${metadata.name}">
                    `;
                    nftList.appendChild(nftItem);

                    tokenId++; // Move to the next tokenId
                } catch (error) {
                    // If fetching metadata fails, it means the token doesn't exist
                    break;
                }
            }
        }

        // Function to fetch NFT metadata (replace with your logic)
        async function fetchNFTMetadata(tokenurl) {
            try {
                // Make an HTTP GET request to the external URL to fetch metadata
                const response = await fetch(tokenurl);
                if (!response.ok) {
                    throw new Error(HTTP request failed with status ${response.status});
                }

                // Parse the JSON response
                const metadata = await response.json();

                // Extract the desired properties (name, description, image) from the metadata
                const { name, description, image } = metadata;

                return {
                    name,
                    description,
                    imgUrl: image, // You may not need to modify the image URL
                };
            } catch (error) {
                console.error('Error fetching NFT metadata:', error);
                return {
                    name: 'Error',
                    description: 'Failed to fetch metadata',
                    imgUrl: '', // You can provide a placeholder image or leave it empty
                };
            }
        }

    </script>
</body>
</html>