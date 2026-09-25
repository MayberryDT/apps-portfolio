// Expanded first-person copy. Private provenance: ../source/copy-provenance.md.
// Photo names/context were supplied by Tyler; broader biography is locally sourced.
import {galleryPhotos} from './scene-data.js';
const story=(lead,text)=>`<p class="panel-lead">${lead}</p><p>${text}</p>`;
const entries=[
  {
    "id": "cotton",
    "src": "tyler-and-cotton",
    "label": "Cotton",
    "title": "Me and Cotton",
    "subtitle": "An everyday moment",
    "category": "Life with Cotton",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">We found her driving past a park</p><p>Cotton came into our lives on a drive past a park: my girlfriend and I found her there. $50 later, on her way home with us.</p><p>This is someone who belongs in the story alongside all the places on the wall. If those tell you where I&#39;ve been, here&#39;s a bit of who was there: the 2 of us together.</p>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">Snow and swimming suit her</p><p>Out swimming, in the snow, hiking with us — Cotton loves all of it, which makes sense for a mostly husky mix of about 4 sled-dog breeds. In the heat, with that coat, she&#39;s considerably less pleased.</p><p>She has her own part in the outdoor side of my life; cold weather and water are a fairly good place to start with her.</p>"
      ]
    ]
  },
  {
    "id": "castle",
    "src": "matsumoto-castle",
    "label": "Matsumoto",
    "title": "Matsumoto",
    "subtitle": "Matsumoto Castle · Japan",
    "category": "Life in Japan",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Matsumoto was home</p><p>If you recognize Matsumoto Castle, that&#39;s where this is, and the Hakuba and Shinshu photos come from the same Japan chapter. I lived in Matsumoto during that time.</p><p>Designated a National Treasure of Japan, the keep dates to 1594; its 6 floors look like 5 stories from outside. Surviving into the present took some help, as local residents saved it from demolition in the Meiji era.</p><a class=\"book-source\" href=\"https://www.matsumoto-castle.jp/eng/about\" target=\"_blank\" rel=\"noopener noreferrer\">About Matsumoto Castle <span aria-hidden=\"true\">↗</span></a>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">My first country abroad</p><p>Japan, the first country I went to abroad, changed how I saw the world. That change came with roughly 3 years there: learning Japanese, making friends and teaching English.</p><p>Around all of that, I lived in Matsumoto: time in the mountains at Hakuba, and teaching that left me with the drawing on the shelf. At Shinshu, meanwhile, I was in the intensive language program.</p>"
      ]
    ]
  },
  {
    "id": "hakuba",
    "src": "hakuba-snowboarding",
    "label": "Hakuba",
    "title": "Hakuba",
    "subtitle": "Snowboarding · Japan",
    "category": "Out in the mountains",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Snowboarding in Hakuba</p><p>During my time in Japan, alongside study and teaching, I got outside too.</p><p>And when there was snow? That&#39;s me in Hakuba.</p><p>In 1998, international attention from the Winter Olympics, and across the area, several mountain resorts. There&#39;s a much larger winter-sports setting around this one photo.</p><p>Head into Nagano&#39;s Japanese Alps and you&#39;re in Hakuba.</p><a class=\"book-source\" href=\"https://www.japan.travel/en/spot/ma_95/\" target=\"_blank\" rel=\"noopener noreferrer\">About Hakuba <span aria-hidden=\"true\">↗</span></a>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">Life around studying Japanese</p><p>In Japan, over roughly 3 years, teaching English, making friends and getting outdoors filled out the time around intensive Japanese study at Shinshu University.</p><p>The Colorado hiking photos show a different place and activity, and this picture belongs alongside them: part of life there, away from a computer.</p>"
      ]
    ]
  },
  {
    "id": "canggu",
    "src": "bali-beach",
    "label": "Canggu",
    "title": "Canggu",
    "subtitle": "Bali · Indonesia",
    "category": "Life in Bali",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Somewhere I came back to often</p><p>This Canggu beach became familiar: I visited often during about a year living in Bali.</p><p>In a photograph, you get the coastline. Living there — getting to know people, coming back to places — made it part of everyday life.</p>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">The people were a big part of it</p><p>Loved the weather, the people, the friendships I made. (Those relationships belong in the Bali story as much as the beach.)</p><p>Bali was part of my twenties — different countries, languages, time outside and projects to try. The entrepreneurship and freedom books on the shelf connect to that history too.</p>"
      ]
    ]
  },
  {
    "id": "silverton",
    "src": "durango-silverton-train",
    "label": "Silverton",
    "title": "Silverton",
    "subtitle": "Durango–Silverton train · Colorado",
    "category": "Exploring Colorado",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Taking the train to Silverton</p><p>Me, taking the Durango–Silverton train to explore Silverton while I lived in Durango. If you&#39;re looking for where this photo fits, it&#39;s from that trip.</p><p>The railway, carrying passengers and freight through a mining region, reached Silverton in 1882. Along the Animas River. The route connects the 2 towns and carries a lot of their history with it.</p><a class=\"book-source\" href=\"https://durangotrain.com/history/\" target=\"_blank\" rel=\"noopener noreferrer\">The railway’s history <span aria-hidden=\"true\">↗</span></a>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">Exploring around Durango</p><p>Durango was home for a while, and the train gave me one way to explore around it: the hiking photo comes from that part of my life too.</p><p>Put together, the photos give these places more of a story than a list would.</p><p>Japan, Bali and Oklahoma in the other pictures. Silverton, one outing within the Colorado chapter.</p>"
      ]
    ]
  },
  {
    "id": "shinshu",
    "src": "wasabi-statue",
    "label": "Shinshu",
    "title": "Shinshu days",
    "subtitle": "Study abroad · Japan",
    "category": "Learning Japanese",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Studying Japanese with a wasabi statue nearby</p><p>While I was studying Japanese intensively at Shinshu University in 2015 to 2016, this photo happened.</p><p>That is, yes, a wasabi statue.</p><p>Same wider region as the Matsumoto and Hakuba photos.</p><p>Shinshu itself, across Nagano Prefecture, has 5 main campuses: Matsumoto, Ueda, Ina and 2 with different focuses in Nagano.</p><a class=\"book-source\" href=\"https://www.shinshu-u.ac.jp/english/about/maps-directions/\" target=\"_blank\" rel=\"noopener noreferrer\">Shinshu’s campuses <span aria-hidden=\"true\">↗</span></a>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">Learning the language where I was living</p><p>At Shinshu, part of roughly 3 years in Japan. Around the study, teaching English, making friends and getting outside filled out that time.</p><p>Back at Oklahoma State, I spent about 3 years with the Japanese Student Association, which connects the 2 university experiences through exchange. Helping incoming Japanese students settle in, joining language and cultural events — that was part of my time there.</p>"
      ]
    ]
  },
  {
    "id": "durango",
    "src": "durango-hike",
    "label": "Durango",
    "title": "Durango",
    "subtitle": "Hiking · Colorado",
    "category": "Away from the desk",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">Out hiking in Durango</p><p>Outside, exploring the area around home, and here I am hiking in Durango, Colorado, while I was living there.</p><p>Alongside the snowboarding picture from Japan, this shows some of what I did around the work. The train to Silverton, over in another photo, belongs to the same period.</p>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">I think those years were worth it</p><p>During my twenties, I lived in different countries, learned languages, hiked and tried projects.</p><p>Look back now: worth it, I think. Durango alongside Japan and Bali.</p><p>The life around the projects gets a little more room in these pictures — where I lived, what mattered away from the screen — and the projects show what I&#39;ve worked on making.</p>"
      ]
    ]
  },
  {
    "id": "osu",
    "src": "oklahoma-state-campus",
    "label": "Oklahoma State",
    "title": "Oklahoma State",
    "subtitle": "Stillwater · Oklahoma",
    "category": "University years",
    "tabs": [
      [
        "The photo",
        "<p class=\"panel-lead\">6 years in Stillwater</p><p>With the learning and university community, it was a substantial part of my life.</p><p>I spent 6 years in Stillwater, Oklahoma, studying at Oklahoma State University.</p><p>Japanese-language and cultural exchange, and collegiate League of Legends, were also part of my time at OSU, a land-grant university founded in 1890 with its main campus in Stillwater.</p><a class=\"book-source\" href=\"https://go.okstate.edu/about-osu\" target=\"_blank\" rel=\"noopener noreferrer\">About Oklahoma State <span aria-hidden=\"true\">↗</span></a>"
      ],
      [
        "My story",
        "<p class=\"panel-lead\">The connection to Japan</p><p>At OSU, I spent about 3 years with the Japanese Student Association and was president in my final semester. Helping incoming Japanese students settle in, taking part in cultural and language events.</p><p>Follow the connections from the campus photo and you get to Shinshu on the wall and Shaco on the shelf. A collegiate League team, briefly, and a handful of amateur tournaments were part of my time there too.</p>"
      ]
    ]
  }
];
export const photoStories=entries.map((item,index)=>({...item,object:item.id,objectName:item.title,mark:`${String(index+1).padStart(2,'0')} / 08`,footnote:'From my photo wall',photo:galleryPhotos.find(photo=>photo.src===item.src)}));
export const photoById=new Map(photoStories.map(item=>[item.id,item]));
export const photoViews=Object.fromEntries(photoStories.map(item=>{
 const [x,y,w,h]=item.photo.rect,f=6.2;
 return[item.id,{point:[x+w/2,y+h/2],bounds:[x,y,x+w,y+h],inspectBounds:[x-f,y-f,x+w+f,y+h+f]}];
}));
