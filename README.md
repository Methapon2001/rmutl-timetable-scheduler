# RMUTL Computer Engineering Timetable System

## Prerequisite
- [Node.js LTS](https://nodejs.org/en/download)
  * Linux can install using nvm `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash`
  * Version used in development is 18.x.x
- [MariaDB/MySQL](https://mariadb.org/download)
  * For windows, can use [XAMPP](https://www.apachefriends.org/) 
  * For linux, can install from distro repositories

## Installation
- `npm i -g pnpm`
- `git clone https://github.com/Methapon2001/rmutl-timetable-scheduler.git`
- `cd rmutl-timetable-scheduler`
- `pnpm i`
- Create `.env` file
  ```env
  DATABASE_URL="mysql://username:password@localhost:port/database_name"
  APP_SECRET="my_secret"
  APP_PORT=80
  ```
- `cd client`
- `pnpm i`
- Create `.env` file and replace hostname with IP Address or Domain name
  ```env
  PUBLIC_API_HOST="http://hostname"
  PUBLIC_API_WS="ws://hostname/websocket"
  ```
- `pnpm build`
- `cd ..`
- `pnpm db:push`
- `pnpm db:seed`
- `pnpm start` or using `pm2` to run server.
