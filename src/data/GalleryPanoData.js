// The amenity level's walkable 360° tour, exported by the Marzipano Tool and copied in
// verbatim (app-files/data.js) — only the export line below is added. Tiles live at
// public/assets/Gallary/tiles. Each scene's linkHotspots are the walk-through arrows.

var APP_DATA = {
  "scenes": [
    {
      "id": "0-gameroom_cam01",
      "name": "GameRoom_Cam01",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.5415481554450849,
        "pitch": 0.009771336073686854,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.20190830384856,
          "pitch": 0.06958989282409611,
          "rotation": 0,
          "target": "1-gameroom_cam02"
        },
        {
          "yaw": -0.2048956356036289,
          "pitch": 0.14688141744584193,
          "rotation": 0,
          "target": "2-gameroom_cam03"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-gameroom_cam02",
      "name": "GameRoom_Cam02",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.20336528960732103,
        "pitch": -0.02931400822104635,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.5099255477351505,
          "pitch": 0.11820320294219044,
          "rotation": 0,
          "target": "0-gameroom_cam01"
        },
        {
          "yaw": -0.08395232574893186,
          "pitch": 0.08122347015523346,
          "rotation": 0,
          "target": "2-gameroom_cam03"
        },
        {
          "yaw": 3.105094256285261,
          "pitch": 0.2621529173545092,
          "rotation": 0,
          "target": "6-lift-cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-gameroom_cam03",
      "name": "GameRoom_Cam03",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.9922825231906316,
        "pitch": 0.022492543714069058,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 1.7651682266606716,
          "pitch": 0.1373607977885971,
          "rotation": 0,
          "target": "0-gameroom_cam01"
        },
        {
          "yaw": 0.5409053135505673,
          "pitch": 0.11417519202667492,
          "rotation": 0,
          "target": "1-gameroom_cam02"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-gym_01",
      "name": "GYM_01",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.5325054727990111,
        "pitch": -0.11237036484735441,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.0398971217461686,
          "pitch": 0.062154741237399946,
          "rotation": 0,
          "target": "5-gym_03_view03"
        },
        {
          "yaw": -0.5637711035588158,
          "pitch": 0.1958405494626092,
          "rotation": 0,
          "target": "4-gym_02"
        },
        {
          "yaw": 1.8828719779322114,
          "pitch": 0.41941563466221154,
          "rotation": 0,
          "target": "6-lift-cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "4-gym_02",
      "name": "GYM_02",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.3825551060715533,
        "pitch": 0.05175562143830348,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -2.141589531550405,
          "pitch": 0.25177250254784944,
          "rotation": 0,
          "target": "3-gym_01"
        },
        {
          "yaw": 0.3787338767019204,
          "pitch": 0.1817898408490315,
          "rotation": 0,
          "target": "5-gym_03_view03"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "5-gym_03_view03",
      "name": "GYM_03_View03",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.18440464672992363,
        "pitch": 0.027221617539467502,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.49945996412611926,
          "pitch": 0.12140361361055874,
          "rotation": 0,
          "target": "3-gym_01"
        },
        {
          "yaw": 0.07643810761444314,
          "pitch": 0.22241273375305326,
          "rotation": 0,
          "target": "4-gym_02"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "6-lift-cam_01",
      "name": "Lift cam_01",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.5626999395116528,
          "pitch": 0.24906283684673092,
          "rotation": 0,
          "target": "7-lift-cam_02"
        },
        {
          "yaw": -0.5673912866715085,
          "pitch": 0.09662804381571988,
          "rotation": 0,
          "target": "8-lift-cam_03"
        },
        {
          "yaw": 2.8088383691267236,
          "pitch": 0.17283503296812697,
          "rotation": 0,
          "target": "1-gameroom_cam02"
        },
        {
          "yaw": 0.8898577354010051,
          "pitch": 0.26785232706374806,
          "rotation": 0,
          "target": "3-gym_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "7-lift-cam_02",
      "name": "Lift cam_02",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.09260573660078819,
        "pitch": 0.009771336073683301,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.08236853145765899,
          "pitch": 0.2614214534718933,
          "rotation": 0,
          "target": "6-lift-cam_01"
        },
        {
          "yaw": -3.06277676315103,
          "pitch": 0.17962873601915597,
          "rotation": 0,
          "target": "8-lift-cam_03"
        },
        {
          "yaw": -0.020211515710837347,
          "pitch": 0.037795838214238486,
          "rotation": 0,
          "target": "1-gameroom_cam02"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "8-lift-cam_03",
      "name": "Lift cam_03",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.8743240968315966,
        "pitch": -0.10649778037641866,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.006565724170854992,
          "pitch": 0.21294779717887913,
          "rotation": 0,
          "target": "24-yoga_cam_01"
        },
        {
          "yaw": -1.8751297553309954,
          "pitch": 0.3317551103461085,
          "rotation": 0,
          "target": "9-lift-cam_04"
        },
        {
          "yaw": 1.6262412221919282,
          "pitch": 0.03427391218122544,
          "rotation": 0,
          "target": "7-lift-cam_02"
        },
        {
          "yaw": 1.6236840282796887,
          "pitch": 0.18447246405759365,
          "rotation": 0,
          "target": "6-lift-cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "9-lift-cam_04",
      "name": "Lift cam_04",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -2.486771113370331,
        "pitch": 0.029753273576332617,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.881673286429864,
          "pitch": 0.17850495995782012,
          "rotation": 0,
          "target": "12-lift-cam_07"
        },
        {
          "yaw": 2.9550706516415204,
          "pitch": 0.4073100889972956,
          "rotation": 0,
          "target": "10-lift-cam_05"
        },
        {
          "yaw": 3.0949606017248508,
          "pitch": 0.23906397345333907,
          "rotation": 0,
          "target": "11-lift-cam_06"
        },
        {
          "yaw": 2.966243370276948,
          "pitch": 0.03623764986489242,
          "rotation": 0,
          "target": "13-passage-to-terrace"
        },
        {
          "yaw": 1.3949818067975723,
          "pitch": 0.06577881613498349,
          "rotation": 0,
          "target": "7-lift-cam_02"
        },
        {
          "yaw": 1.3280035565700867,
          "pitch": 0.2082302300928447,
          "rotation": 0,
          "target": "6-lift-cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "10-lift-cam_05",
      "name": "Lift cam_05",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 1.327352342548398,
        "pitch": -0.029905113571889075,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.7222517440092115,
          "pitch": 0.17706612242567132,
          "rotation": 0,
          "target": "12-lift-cam_07"
        },
        {
          "yaw": 1.613720621901365,
          "pitch": 0.25497867100522953,
          "rotation": 0,
          "target": "9-lift-cam_04"
        },
        {
          "yaw": -1.666645988971668,
          "pitch": 0.5486204220863407,
          "rotation": 0,
          "target": "11-lift-cam_06"
        },
        {
          "yaw": -1.5904005442063998,
          "pitch": 0.17358958066337848,
          "rotation": 0,
          "target": "13-passage-to-terrace"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "11-lift-cam_06",
      "name": "Lift cam_06",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.08040040534853077,
          "pitch": 0.29999203682952214,
          "rotation": 0,
          "target": "10-lift-cam_05"
        },
        {
          "yaw": -0.2199168476071982,
          "pitch": 0.1404179649596653,
          "rotation": 0,
          "target": "9-lift-cam_04"
        },
        {
          "yaw": -1.5410737774563863,
          "pitch": 0.37043922138582275,
          "rotation": 0,
          "target": "23-toddler"
        },
        {
          "yaw": 1.8650748843397693,
          "pitch": 0.3685958724493581,
          "rotation": 0,
          "target": "13-passage-to-terrace"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "12-lift-cam_07",
      "name": "Lift cam_07",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.057948013388923414,
        "pitch": 0.02919469402772279,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.9027907178647787,
          "pitch": 0.1027843613478403,
          "rotation": 0,
          "target": "9-lift-cam_04"
        },
        {
          "yaw": 1.4638905930641037,
          "pitch": 0.08967087742008317,
          "rotation": 0,
          "target": "10-lift-cam_05"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "13-passage-to-terrace",
      "name": "Passage to terrace",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.7341082919653452,
          "pitch": 0.2889576256070896,
          "rotation": 0,
          "target": "11-lift-cam_06"
        },
        {
          "yaw": -1.865699333776064,
          "pitch": 0.10893656085034387,
          "rotation": 0,
          "target": "10-lift-cam_05"
        },
        {
          "yaw": -0.23978652901149644,
          "pitch": 0.29186577078951537,
          "rotation": 0,
          "target": "14-cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "14-cam_01",
      "name": "Cam_01",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.6233318757122497,
        "pitch": 0.02198616394821329,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 2.546509118092934,
          "pitch": 0.22684885203997496,
          "rotation": 0,
          "target": "13-passage-to-terrace"
        },
        {
          "yaw": 0.2654008633289333,
          "pitch": 0.2880912019690065,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": 1.239784449298437,
          "pitch": 0.2373408398093808,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": 0,
          "pitch": 0,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": 0.40676590595038853,
          "pitch": -0.01873801124919261,
          "rotation": 0,
          "target": "21-cam08"
        },
        {
          "yaw": 0.40863907829019475,
          "pitch": 0.13964800614158968,
          "rotation": 0,
          "target": "22-cam09"
        },
        {
          "yaw": 0.6094115021350639,
          "pitch": 0.08446261941188737,
          "rotation": 0,
          "target": "19-cam06"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "15-cam_02",
      "name": "Cam_02",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.6945698043650985,
        "pitch": 0.21741287303617796,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -2.639349569709161,
          "pitch": 0.24392839702127134,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": 2.3573790022867094,
          "pitch": 0.34290933930649814,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": -0.13377254846770015,
          "pitch": 0.15287268525777087,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": 0.7098656067036639,
          "pitch": 0.11732592851656598,
          "rotation": 0,
          "target": "21-cam08"
        },
        {
          "yaw": 1.1574837995548428,
          "pitch": 0.17004463031984152,
          "rotation": 0,
          "target": "20-cam07"
        },
        {
          "yaw": 0.4619020805999874,
          "pitch": 0.26275413828934546,
          "rotation": 0,
          "target": "22-cam09"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "16-cam_03",
      "name": "Cam_03",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.39465143257449675,
        "pitch": 0.09456247008543528,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 2.776603359270716,
          "pitch": 0.17505718681515958,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": -2.6985075924103104,
          "pitch": 0.23695461482756386,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": -2.382685346475345,
          "pitch": 0.15051780496172995,
          "rotation": 0,
          "target": "22-cam09"
        },
        {
          "yaw": -1.865210886564988,
          "pitch": 0.14115191340978228,
          "rotation": 0,
          "target": "21-cam08"
        },
        {
          "yaw": 0.4429728401819304,
          "pitch": 0.4741623123156433,
          "rotation": 0,
          "target": "18-cam04"
        },
        {
          "yaw": -2.282876872853251,
          "pitch": 0.030835735635081463,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": -0.205332251225828,
          "pitch": 0.18454501748015062,
          "rotation": 0,
          "target": "27-cm05"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "17-cam_10",
      "name": "Cam_10",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.3583160954344322,
        "pitch": 0.005759586531581817,
        "fov": 1.358380171897675
      },
      "linkHotspots": [
        {
          "yaw": 1.0852162697994796,
          "pitch": 0.30314336407156617,
          "rotation": 0,
          "target": "21-cam08"
        },
        {
          "yaw": 2.7750454571774608,
          "pitch": 0.21326854953192864,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": 2.455769168597719,
          "pitch": 0.3467262832416793,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": 2.118175720082002,
          "pitch": 0.21509204000923,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": 1.3006220596889495,
          "pitch": 0.2108460979899789,
          "rotation": 0,
          "target": "20-cam07"
        },
        {
          "yaw": 1.659137965406888,
          "pitch": 0.692157474210596,
          "rotation": 0,
          "target": "22-cam09"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "18-cam04",
      "name": "Cam04",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.6285729412870147,
          "pitch": 0.0916654778277124,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": -1.6149527874875265,
          "pitch": 0.3252056926324087,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": 0.32132620470300566,
          "pitch": 0.29826793657836603,
          "rotation": 0,
          "target": "27-cm05"
        },
        {
          "yaw": -1.3692853361169863,
          "pitch": 0.06724207889611478,
          "rotation": 0,
          "target": "17-cam_10"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "19-cam06",
      "name": "Cam06",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -2.4726152035789077,
          "pitch": 0.3713995137820252,
          "rotation": 0,
          "target": "27-cm05"
        },
        {
          "yaw": 0.35882305927072267,
          "pitch": 0.24954046165539268,
          "rotation": 0,
          "target": "20-cam07"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "20-cam07",
      "name": "Cam07",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.5308131563422656,
          "pitch": 0.09682426148760115,
          "rotation": 0,
          "target": "21-cam08"
        },
        {
          "yaw": 0.21311737253127205,
          "pitch": 0.14240340161586573,
          "rotation": 0,
          "target": "22-cam09"
        },
        {
          "yaw": 0.40670785776099727,
          "pitch": 0.0653993876514587,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": -0.12260960443905944,
          "pitch": 0.1022255165569188,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": -0.3005869457246728,
          "pitch": 0.03789070760383417,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": -1.4612580029506947,
          "pitch": 0.23904451122159642,
          "rotation": 0,
          "target": "19-cam06"
        },
        {
          "yaw": -1.583780348670972,
          "pitch": 0.6805208840401331,
          "rotation": 0,
          "target": "27-cm05"
        },
        {
          "yaw": -1.3656222608016737,
          "pitch": 0.135145063918781,
          "rotation": 0,
          "target": "27-cm05"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "21-cam08",
      "name": "Cam08",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -1.3339302140242388,
        "pitch": -0.08549919064471467,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.9521003139588533,
          "pitch": 0.24696923515510605,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": -1.9879279893401822,
          "pitch": 0.15049812181740307,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": -1.7386971988039903,
          "pitch": 0.23014308469301525,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": -1.9436632055686598,
          "pitch": 0.7589437371013794,
          "rotation": 0,
          "target": "22-cam09"
        },
        {
          "yaw": 2.706845988598184,
          "pitch": 0.5401831955893606,
          "rotation": 0,
          "target": "20-cam07"
        },
        {
          "yaw": 2.817555369350801,
          "pitch": 0.27635944439671256,
          "rotation": 0,
          "target": "19-cam06"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "22-cam09",
      "name": "Cam09",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.25938575145597653,
          "pitch": 0.1166443016689076,
          "rotation": 0,
          "target": "14-cam_01"
        },
        {
          "yaw": 0.3680190967790029,
          "pitch": 0.26250649841044726,
          "rotation": 0,
          "target": "15-cam_02"
        },
        {
          "yaw": -0.4625586758327316,
          "pitch": 0.1934444129420907,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": 2.025709589273257,
          "pitch": 0.26656158270727914,
          "rotation": 0,
          "target": "17-cam_10"
        },
        {
          "yaw": -2.405861546851142,
          "pitch": 0.22519182373916102,
          "rotation": 0,
          "target": "20-cam07"
        },
        {
          "yaw": -1.7985277017041152,
          "pitch": 0.21715287528265392,
          "rotation": 0,
          "target": "20-cam07"
        },
        {
          "yaw": -1.4749898502728147,
          "pitch": 0.10933845265135389,
          "rotation": 0,
          "target": "19-cam06"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "23-toddler",
      "name": "Toddler",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.00268909879999768,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -2.9592553815675107,
          "pitch": 0.33442350829222534,
          "rotation": 0,
          "target": "11-lift-cam_06"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "24-yoga_cam_01",
      "name": "yoga_cam_01",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.6036699028275834,
        "pitch": 0.1441272070867985,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.044133936522147366,
          "pitch": 0.5307399482985353,
          "rotation": 0,
          "target": "25-yoga_cam_02"
        },
        {
          "yaw": -0.8260266401407268,
          "pitch": 0.21796316846501185,
          "rotation": 0,
          "target": "26-yoga_room_cam_03"
        },
        {
          "yaw": -2.8087381101451285,
          "pitch": 0.4026846030775406,
          "rotation": 0,
          "target": "8-lift-cam_03"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "25-yoga_cam_02",
      "name": "yoga_cam_02",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.405546543864979,
        "pitch": 0.19303078156206155,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -1.423501857339799,
          "pitch": 0.350067862442593,
          "rotation": 0,
          "target": "24-yoga_cam_01"
        },
        {
          "yaw": 0.6357133380969842,
          "pitch": 0.28418442442197644,
          "rotation": 0,
          "target": "26-yoga_room_cam_03"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "26-yoga_room_cam_03",
      "name": "yoga_room_cam_03",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": -0.02437990942683399,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": -0.3285794487274263,
          "pitch": 0.3658917170005189,
          "rotation": 0,
          "target": "25-yoga_cam_02"
        },
        {
          "yaw": 0.12309265945617653,
          "pitch": 0.24079933067597992,
          "rotation": 0,
          "target": "24-yoga_cam_01"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "27-cm05",
      "name": "Cm05",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "yaw": 0.00007877230000019608,
        "pitch": 0,
        "fov": 1.4070723946101482
      },
      "linkHotspots": [
        {
          "yaw": 0.000303518164244565,
          "pitch": 0.3010777770641795,
          "rotation": 0,
          "target": "19-cam06"
        },
        {
          "yaw": -1.3356215416509123,
          "pitch": 0.1695763742120846,
          "rotation": 0,
          "target": "16-cam_03"
        },
        {
          "yaw": -0.15675364044849616,
          "pitch": 0.12854739934272175,
          "rotation": 0,
          "target": "20-cam07"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "Project Title",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": false,
    "viewControlButtons": false
  }
};

export default APP_DATA;
