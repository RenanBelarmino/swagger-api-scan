sudo apt-get update
sudo apt-get upgrade -y
sudo curl -fsSL https://fnm.vercel.app/install | bash
#sudo fnm use --install-if-missing 20
sudo apt install
sudo git clone https://renan.belarmino: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@github.com/RenanBelarmino/kazza-api-scan.git
cd kazza-api-scan/



sudo apt install npm -y
#sudo npm init -y
#sudo npm start init -y
sudo npm install swagger-jsdoc swagger-ui-express -y
sudo npm install express-basic-auth -y

sudo npm install axios -y
sudo npm install swagger-jsdoc swagger-ui-express -y
sudo npm install dotenv -y
sudo chmod -R 777 node_modules

sudo npm install -g pm2 -y

sudo pm2 start index.js --name=kz_services
sudo pm2 startup ubuntu
sudo pm2 save


sudo snap install docker

sudo docker run -u zap -p 8080:8080 -i zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.key=kzservices_
sudo docker start $(docker ps -aq)

