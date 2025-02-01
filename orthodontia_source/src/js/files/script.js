// Подключение функционала "Чертогов Фрилансера"
import { isMobile } from "./functions.js";
// Подключение списка активных модулей
import { mhzModules } from "./modules.js";

import './pages/common/common.js'
import './pages/common/header.js'
import './pages/home.js'
import './pages/events.js'
import './pages/speaker.js'
import './pages/learnings.js'
import './pages/library.js'
import './pages/records.js'
import './pages/contacts.js'
import './pages/profile.js'


window.mhzModules = mhzModules;