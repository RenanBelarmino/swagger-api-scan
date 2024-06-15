sudo apt-get update
sudo apt-get upgrade -y
sudo curl -fsSL https://fnm.vercel.app/install | bash
#sudo fnm use --install-if-missing 20
sudo apt install
sudo git clone https://renan.belarmino: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@github.com/RenanBelarmino/swagger-api-scan.git
cd swagger-api-scan/


sudo apt install npm -y
#sudo npm init -y
#sudo npm start init -y
sudo npm install swagger-jsdoc swagger-ui-express -y
sudo npm install express-basic-auth -y

sudo npm install axios -y
sudo npm install swagger-jsdoc swagger-ui-express -y
sudo npm install dotenv -y
sudo chmod -R 777 node_modules
sudo npm install dockerode
sudo npm install jsonwebtoken bcryptjs express express-jwt


sudo npm install -g pm2 -y

sudo pm2 start index.js --name=services
sudo pm2 startup ubuntu
sudo pm2 save


sudo snap install docker

sudo docker run -u zap -p 8080:8080 -i zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.key=services_

docker run -v "${PWD}:/zap/wrk/:rw" -t zaproxy/zap-stable zap-full-scan.py -t https://www.example.com -g gen.conf -J report_json
docker exec dast_scan zap-full-scan.py -t https://www.example.com -g gen.conf -J report_json

sudo docker start $(docker ps -aq)


