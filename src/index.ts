import {ClientWrapper} from "./ClientWrapper";

require('dotenv').config();

new ClientWrapper();

ClientWrapper.get().login(process.env.TOKEN);