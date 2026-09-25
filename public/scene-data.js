import {shelfStills} from './shelf-stills.js';
import {drawingRect} from './shelf-data.js';
// One photographic coordinate system, shared by every route and every frame.
// x/y/width/height and clipping polygons are in the original 1448 × 1086 room.
export const tiles=[
 {id:'photo-wall-clean',rect:[0,0,1448,1086],clip:[[568,140],[901,140],[901,555],[568,555]],feather:5},
 {id:'photographic-desk',rect:[160,350,400,210],clip:[[188,351],[269,351],[273,451],[298,451],[298,403],[408,403],[408,470],[523,470],[523,515],[221,515],[214,487],[188,475]],feather:1.1},
 {id:'desk-reveal',key:'helm-reveal',rect:[160,350,400,210],clip:[[247,480],[276,478],[295,472],[299,476],[283,487],[279,505],[242,506],[242,496]],feather:.5},
 // High-definition entry-table surface; keep the rear desk/screens from v17.
 {id:'contact-clean',rect:[0,440,380,230],clip:[[0,442],[110,442],[110,468],[196,468],[212,504],[238,537],[376,537],[376,658],[0,670]],feather:2},
 {id:'bookshelf',rect:[649,179,734,467],clip:[[914,215],[1252,215],[1252,475],[1117,475],[1117,512],[919,512]],feather:2},
 {id:'shelf-empty',rect:[914,215,338,220],clip:[[937,231],[1250,231],[1250,432],[937,432]],feather:.65},
 // Bounded inpainting: only the removed figure/carton and their shadows change.
 {id:'shelf-removals',key:'carton-removed',rect:[914,215,338,310],clip:[[983,445],[1061,445],[1061,525],[983,525]],feather:4},
 {id:'journal',key:'chair',rect:[759,314,653,380],clip:[[1140,513],[1284,513],[1284,564],[1140,564]],feather:10},
 {id:'journal',rect:[812,349,595,374],clip:[[1060,631],[1075,619],[1085,619],[1085,669],[1285,669],[1285,637],[1306,644],[1311,656],[1301,670],[1270,680],[1200,685],[1120,675],[1069,658]],feather:2},
 {id:'notebook',rect:[1057,596,238,90],clip:[[1077.22, 618.71], [1083.79, 616.47], [1162.19, 614.15], [1172.06, 615.14], [1176.49, 617.3], [1180.27, 615.31], [1259.83, 613.73], [1266.89, 616.55], [1291.55, 667.02], [1288.75, 669.26], [1186.35, 670.17], [1184.38, 668.76], [1176.99, 670.17], [1067.19, 669.67], [1067.19, 667.27]],feather:.65},
 {id:'journal-clean',rect:[812,349,595,374],clip:[[1063,612],[1270,609],[1303,668],[1299,678],[1062,678]],feather:1.8}
];
export const views={
 desk:{center:[342,451],zoom:2.5,mobile:1.3,point:[349,453],bounds:[280,405,406,497],inspect:4.8,inspectMobile:2.2},
 photos:{center:[741,321],areaBounds:[590,168,892,473],point:[742.0,217.99628252788105],bounds:[689.0,178.0,795.0,257.9925650557621],inspectBounds:[682.8,171.8,801.2,264.1925650557621]},
 bookshelf:{center:[1085,320],areaBounds:[908,205,1262,435],zoom:2.7,mobile:1.3,point:[1147,282],bounds:[1110,240,1184,324],inspect:7,inspectMobile:2.7},
 journal:{center:[1185,650],zoom:2.6,mobile:1.2,point:[1181,638],bounds:[1065,615,1310,672],inspect:3.7,inspectMobile:1.45},
 contact:{center:[210,564],zoom:2.7,mobile:1.2,point:[156,522],bounds:[137,496,176,565],inspect:6.3,inspectMobile:3.1}
};
// Original personal textures cover AI placeholder content in the generated tiles.
export const artFrames={
 'Tyler_and_Cotton':[600.0,178.0,660.0,259.30111524163567],
 'Matsumoto_Castle':[689.0,178.0,795.0,257.9925650557621],
 'Snowboarding_in_Hakuba':[822.0,178.0,882.0,258.0561797752809],
 'Canggu,_Bali':[600.0,292.0,687.0,356.86572438162545],
 'Durango_to_Silverton':[712.0,288.0,762.0,355.3974540311174],
 'Mr_Tyler_—_student_drawing':[drawingRect[0],drawingRect[1],drawingRect[0]+drawingRect[2],drawingRect[1]+drawingRect[3]],
 'Oklahoma_State_University':[710.0,383.0,870.0,465.95652173913044]
};

export const extraViews={
 helm:{point:[263,474],bounds:[245,480,278,505],inspect:7.2,inspectMobile:4.1},
 omarchy:{point:[231,413],nodePoint:[231,456],mobileNodePoint:[231,423],bounds:[190,350,270,480],inspect:4.4,inspectMobile:2.1}
};

// Eight original photographs, in three compact rows on the cleared wall.
export const galleryPhotos=[
 {src:'tyler-and-cotton',alt:'Tyler and Cotton in the car',rect:[600,178,60,81.30111524]},
 {src:'matsumoto-castle',alt:'Matsumoto Castle, Japan',rect:[689,178,106,79.99256506]},
 {src:'hakuba-snowboarding',alt:'Snowboarding in Hakuba, Japan',rect:[822,178,60,80.05617978]},
 {src:'bali-beach',alt:'Canggu Beach, Bali',rect:[600,292,87,64.86572438]},
 {src:'durango-silverton-train',alt:'The Durango to Silverton train trip',rect:[712,288,50,67.39745403]},
 {src:'wasabi-statue',alt:'Study abroad at Shinshu University, sitting on a wasabi statue',rect:[798,292,70,69.74910394]},
 {src:'durango-hike',alt:'Hiking in Durango, Colorado',rect:[608,388,56,75.10233393]},
 {src:'oklahoma-state-campus',alt:'Oklahoma State University campus',rect:[710,383,160,82.95652174]}
];
export const addedPhotos=[
 ...galleryPhotos.map(photo=>({...photo,frame:true}))
];
export const objectStills=[
 {id:'contact-rest',rect:[132,491,49,85]},
 {id:'helm-rest',rect:[233,471,60,46]},
 ...shelfStills
];
