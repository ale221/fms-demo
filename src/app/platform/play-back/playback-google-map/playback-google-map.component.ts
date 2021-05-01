import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-playback-google-map',
  templateUrl: './playback-google-map.component.html',
  styleUrls: ['./playback-google-map.component.css']
})
export class PlaybackGoogleMapComponent implements OnInit, AfterViewInit {
  // google map props
  response = [
  {
    "lat": 25.316853,
    "long": 51.456142,
    "speed": 7.44,
    "timestamp": "2020-08-25 05:54:56+00:00",
    "timestamp_unix": "1598334896"
  },
  {
    "lat": 25.318014,
    "long": 51.457329,
    "speed": 12.21,
    "timestamp": "2020-08-25 07:05:09+00:00",
    "timestamp_unix": "1598339109"
  },
  {
    "lat": 25.316475,
    "long": 51.458267,
    "speed": 20.19,
    "timestamp": "2020-08-25 07:07:04+00:00",
    "timestamp_unix": "1598339224"
  },
  {
    "lat": 25.315981,
    "long": 51.456661,
    "speed": 16.35,
    "timestamp": "2020-08-25 07:07:30+00:00",
    "timestamp_unix": "1598339250"
  },
  {
    "lat": 25.315332,
    "long": 51.455288,
    "speed": 24.56,
    "timestamp": "2020-08-25 07:07:49+00:00",
    "timestamp_unix": "1598339269"
  },
  {
    "lat": 25.314985,
    "long": 51.453587,
    "speed": 25.7,
    "timestamp": "2020-08-25 07:08:05+00:00",
    "timestamp_unix": "1598339285"
  },
  {
    "lat": 25.314568,
    "long": 51.451542,
    "speed": 24.7,
    "timestamp": "2020-08-25 07:08:19+00:00",
    "timestamp_unix": "1598339299"
  },
  {
    "lat": 25.315765,
    "long": 51.450554,
    "speed": 34.71,
    "timestamp": "2020-08-25 07:08:34+00:00",
    "timestamp_unix": "1598339314"
  },
  {
    "lat": 25.317509,
    "long": 51.449707,
    "speed": 34.66,
    "timestamp": "2020-08-25 07:08:45+00:00",
    "timestamp_unix": "1598339325"
  },
  {
    "lat": 25.318922,
    "long": 51.449112,
    "speed": 7.76,
    "timestamp": "2020-08-25 07:09:00+00:00",
    "timestamp_unix": "1598339340"
  },
  {
    "lat": 25.321959,
    "long": 51.44825,
    "speed": 36.16,
    "timestamp": "2020-08-25 07:11:42+00:00",
    "timestamp_unix": "1598339502"
  },
  {
    "lat": 25.323647,
    "long": 51.447861,
    "speed": 22.98,
    "timestamp": "2020-08-25 07:11:55+00:00",
    "timestamp_unix": "1598339515"
  },
  {
    "lat": 25.32501,
    "long": 51.447586,
    "speed": 19.21,
    "timestamp": "2020-08-25 07:12:07+00:00",
    "timestamp_unix": "1598339527"
  },
  {
    "lat": 25.326811,
    "long": 51.447395,
    "speed": 23.9,
    "timestamp": "2020-08-25 07:12:23+00:00",
    "timestamp_unix": "1598339543"
  },
  {
    "lat": 25.328466,
    "long": 51.447376,
    "speed": 20.97,
    "timestamp": "2020-08-25 07:12:38+00:00",
    "timestamp_unix": "1598339558"
  },
  {
    "lat": 25.33003,
    "long": 51.447346,
    "speed": 15.34,
    "timestamp": "2020-08-25 07:12:54+00:00",
    "timestamp_unix": "1598339574"
  },
  {
    "lat": 25.328369,
    "long": 51.446846,
    "speed": 37.94,
    "timestamp": "2020-08-25 07:13:10+00:00",
    "timestamp_unix": "1598339590"
  },
  {
    "lat": 25.326614,
    "long": 51.44685,
    "speed": 35.38,
    "timestamp": "2020-08-25 07:13:20+00:00",
    "timestamp_unix": "1598339600"
  },
  {
    "lat": 25.325314,
    "long": 51.446033,
    "speed": 24.63,
    "timestamp": "2020-08-25 07:13:36+00:00",
    "timestamp_unix": "1598339616"
  },
  {
    "lat": 25.325563,
    "long": 51.443676,
    "speed": 5.66,
    "timestamp": "2020-08-25 07:14:04+00:00",
    "timestamp_unix": "1598339644"
  },
  {
    "lat": 25.325575,
    "long": 51.442036,
    "speed": 17.72,
    "timestamp": "2020-08-25 07:14:28+00:00",
    "timestamp_unix": "1598339668"
  },
  {
    "lat": 25.325436,
    "long": 51.440182,
    "speed": 14.91,
    "timestamp": "2020-08-25 07:14:49+00:00",
    "timestamp_unix": "1598339689"
  },
  {
    "lat": 25.325445,
    "long": 51.438644,
    "speed": 13.62,
    "timestamp": "2020-08-25 07:15:04+00:00",
    "timestamp_unix": "1598339704"
  },
  {
    "lat": 25.325079,
    "long": 51.440136,
    "speed": 17.68,
    "timestamp": "2020-08-25 07:15:29+00:00",
    "timestamp_unix": "1598339729"
  },
  {
    "lat": 25.323666,
    "long": 51.438816,
    "speed": 18.16,
    "timestamp": "2020-08-25 07:16:09+00:00",
    "timestamp_unix": "1598339769"
  },
  {
    "lat": 25.324774,
    "long": 51.437775,
    "speed": 5.44,
    "timestamp": "2020-08-25 07:31:01+00:00",
    "timestamp_unix": "1598340661"
  },
  {
    "lat": 25.32349,
    "long": 51.438286,
    "speed": 4.1,
    "timestamp": "2020-08-25 09:17:37+00:00",
    "timestamp_unix": "1598347057"
  },
  {
    "lat": 25.324797,
    "long": 51.437824,
    "timestamp": "2020-08-25 09:19:30+00:00",
    "timestamp_unix": "1598347170"
  },
  {
    "lat": 25.325121,
    "long": 51.439396,
    "speed": 14.86,
    "timestamp": "2020-08-25 10:44:40+00:00",
    "timestamp_unix": "1598352280"
  },
  {
    "lat": 25.325531,
    "long": 51.437675,
    "speed": 9.68,
    "timestamp": "2020-08-25 10:45:29+00:00",
    "timestamp_unix": "1598352329"
  },
  {
    "lat": 25.325485,
    "long": 51.436062,
    "speed": 18.5,
    "timestamp": "2020-08-25 10:45:54+00:00",
    "timestamp_unix": "1598352354"
  },
  {
    "lat": 25.326645,
    "long": 51.435173,
    "speed": 16.65,
    "timestamp": "2020-08-25 10:46:19+00:00",
    "timestamp_unix": "1598352379"
  },
  {
    "lat": 25.328279,
    "long": 51.435501,
    "speed": 21.17,
    "timestamp": "2020-08-25 10:46:45+00:00",
    "timestamp_unix": "1598352405"
  },
  {
    "lat": 25.329798,
    "long": 51.435814,
    "speed": 18.97,
    "timestamp": "2020-08-25 10:47:03+00:00",
    "timestamp_unix": "1598352423"
  },
  {
    "lat": 25.331215,
    "long": 51.436028,
    "speed": 19.02,
    "timestamp": "2020-08-25 10:47:18+00:00",
    "timestamp_unix": "1598352438"
  },
  {
    "lat": 25.331894,
    "long": 51.433945,
    "speed": 24.92,
    "timestamp": "2020-08-25 10:47:42+00:00",
    "timestamp_unix": "1598352462"
  },
  {
    "lat": 25.332138,
    "long": 51.432232,
    "speed": 28.78,
    "timestamp": "2020-08-25 10:47:54+00:00",
    "timestamp_unix": "1598352474"
  },
  {
    "lat": 25.332371,
    "long": 51.430664,
    "speed": 27.92,
    "timestamp": "2020-08-25 10:48:05+00:00",
    "timestamp_unix": "1598352485"
  },
  {
    "lat": 25.332624,
    "long": 51.429035,
    "speed": 20.75,
    "timestamp": "2020-08-25 10:48:22+00:00",
    "timestamp_unix": "1598352502"
  },
  {
    "lat": 25.333679,
    "long": 51.428001,
    "speed": 26.49,
    "timestamp": "2020-08-25 10:48:49+00:00",
    "timestamp_unix": "1598352529"
  },
  {
    "lat": 25.334925,
    "long": 51.428753,
    "speed": 32.5,
    "timestamp": "2020-08-25 10:48:59+00:00",
    "timestamp_unix": "1598352539"
  },
  {
    "lat": 25.338793,
    "long": 51.431087,
    "speed": 36.23,
    "timestamp": "2020-08-25 10:49:25+00:00",
    "timestamp_unix": "1598352565"
  },
  {
    "lat": 25.340288,
    "long": 51.431999,
    "speed": 24.66,
    "timestamp": "2020-08-25 10:49:36+00:00",
    "timestamp_unix": "1598352576"
  },
  {
    "lat": 25.341688,
    "long": 51.431885,
    "speed": 27.99,
    "timestamp": "2020-08-25 10:49:51+00:00",
    "timestamp_unix": "1598352591"
  },
  {
    "lat": 25.343733,
    "long": 51.431145,
    "speed": 32.69,
    "timestamp": "2020-08-25 10:50:06+00:00",
    "timestamp_unix": "1598352606"
  },
  {
    "lat": 25.345276,
    "long": 51.430584,
    "speed": 31.75,
    "timestamp": "2020-08-25 10:50:17+00:00",
    "timestamp_unix": "1598352617"
  },
  {
    "lat": 25.346643,
    "long": 51.430088,
    "speed": 30.35,
    "timestamp": "2020-08-25 10:50:27+00:00",
    "timestamp_unix": "1598352627"
  },
  {
    "lat": 25.348186,
    "long": 51.429527,
    "speed": 33.55,
    "timestamp": "2020-08-25 10:50:38+00:00",
    "timestamp_unix": "1598352638"
  },
  {
    "lat": 25.349726,
    "long": 51.428974,
    "speed": 35.78,
    "timestamp": "2020-08-25 10:50:48+00:00",
    "timestamp_unix": "1598352648"
  },
  {
    "lat": 25.351274,
    "long": 51.428761,
    "speed": 25.63,
    "timestamp": "2020-08-25 10:50:58+00:00",
    "timestamp_unix": "1598352658"
  },
  {
    "lat": 25.352736,
    "long": 51.428692,
    "speed": 27.55,
    "timestamp": "2020-08-25 10:51:14+00:00",
    "timestamp_unix": "1598352674"
  },
  {
    "lat": 25.354858,
    "long": 51.428757,
    "speed": 30.96,
    "timestamp": "2020-08-25 10:51:29+00:00",
    "timestamp_unix": "1598352689"
  },
  {
    "lat": 25.356659,
    "long": 51.428661,
    "speed": 33.44,
    "timestamp": "2020-08-25 10:51:41+00:00",
    "timestamp_unix": "1598352701"
  },
  {
    "lat": 25.358295,
    "long": 51.428318,
    "speed": 31.65,
    "timestamp": "2020-08-25 10:51:52+00:00",
    "timestamp_unix": "1598352712"
  },
  {
    "lat": 25.362951,
    "long": 51.426731,
    "speed": 31.06,
    "timestamp": "2020-08-25 10:52:24+00:00",
    "timestamp_unix": "1598352744"
  },
  {
    "lat": 25.365612,
    "long": 51.425789,
    "speed": 32.02,
    "timestamp": "2020-08-25 10:52:43+00:00",
    "timestamp_unix": "1598352763"
  },
  {
    "lat": 25.367022,
    "long": 51.425106,
    "speed": 24.18,
    "timestamp": "2020-08-25 10:53:00+00:00",
    "timestamp_unix": "1598352780"
  },
  {
    "lat": 25.368204,
    "long": 51.423916,
    "speed": 32.31,
    "timestamp": "2020-08-25 10:53:12+00:00",
    "timestamp_unix": "1598352792"
  },
  {
    "lat": 25.370138,
    "long": 51.42239,
    "speed": 29.5,
    "timestamp": "2020-08-25 10:53:28+00:00",
    "timestamp_unix": "1598352808"
  },
  {
    "lat": 25.371401,
    "long": 51.42308,
    "speed": 34.35,
    "timestamp": "2020-08-25 10:53:43+00:00",
    "timestamp_unix": "1598352823"
  },
  {
    "lat": 25.372702,
    "long": 51.425903,
    "speed": 45.22,
    "timestamp": "2020-08-25 10:53:58+00:00",
    "timestamp_unix": "1598352838"
  },
  {
    "lat": 25.373806,
    "long": 51.428368,
    "speed": 42.05,
    "timestamp": "2020-08-25 10:54:10+00:00",
    "timestamp_unix": "1598352850"
  },
  {
    "lat": 25.374771,
    "long": 51.430439,
    "speed": 38.44,
    "timestamp": "2020-08-25 10:54:21+00:00",
    "timestamp_unix": "1598352861"
  },
  {
    "lat": 25.378717,
    "long": 51.429352,
    "speed": 34.08,
    "timestamp": "2020-08-25 10:54:58+00:00",
    "timestamp_unix": "1598352898"
  },
  {
    "lat": 25.380806,
    "long": 51.427952,
    "speed": 32.23,
    "timestamp": "2020-08-25 10:55:14+00:00",
    "timestamp_unix": "1598352914"
  },
  {
    "lat": 25.382214,
    "long": 51.427094,
    "speed": 16.8,
    "timestamp": "2020-08-25 10:55:29+00:00",
    "timestamp_unix": "1598352929"
  },
  {
    "lat": 25.38397,
    "long": 51.425812,
    "speed": 30.57,
    "timestamp": "2020-08-25 10:55:47+00:00",
    "timestamp_unix": "1598352947"
  },
  {
    "lat": 25.386051,
    "long": 51.424423,
    "speed": 32.63,
    "timestamp": "2020-08-25 10:56:03+00:00",
    "timestamp_unix": "1598352963"
  },
  {
    "lat": 25.387924,
    "long": 51.423176,
    "speed": 32.39,
    "timestamp": "2020-08-25 10:56:17+00:00",
    "timestamp_unix": "1598352977"
  },
  {
    "lat": 25.389572,
    "long": 51.422073,
    "speed": 33.34,
    "timestamp": "2020-08-25 10:56:29+00:00",
    "timestamp_unix": "1598352989"
  },
  {
    "lat": 25.390814,
    "long": 51.421253,
    "speed": 29.13,
    "timestamp": "2020-08-25 10:56:39+00:00",
    "timestamp_unix": "1598352999"
  },
  {
    "lat": 25.392134,
    "long": 51.420418,
    "speed": 15.16,
    "timestamp": "2020-08-25 10:56:52+00:00",
    "timestamp_unix": "1598353012"
  },
  {
    "lat": 25.392811,
    "long": 51.421906,
    "speed": 16.91,
    "timestamp": "2020-08-25 10:57:25+00:00",
    "timestamp_unix": "1598353045"
  },
  {
    "lat": 25.394167,
    "long": 51.421787,
    "speed": 8.39,
    "timestamp": "2020-08-25 10:57:52+00:00",
    "timestamp_unix": "1598353072"
  },
  {
    "lat": 25.394884,
    "long": 51.423061,
    "speed": 14.1,
    "timestamp": "2020-08-25 10:58:20+00:00",
    "timestamp_unix": "1598353100"
  },
  {
    "lat": 25.394964,
    "long": 51.424828,
    "speed": 16.83,
    "timestamp": "2020-08-25 10:58:48+00:00",
    "timestamp_unix": "1598353128"
  },
  {
    "lat": 25.394943,
    "long": 51.42329,
    "speed": 11.07,
    "timestamp": "2020-08-25 11:42:03+00:00",
    "timestamp_unix": "1598355723"
  },
  {
    "lat": 25.394285,
    "long": 51.421749,
    "speed": 7.75,
    "timestamp": "2020-08-25 11:42:32+00:00",
    "timestamp_unix": "1598355752"
  },
  {
    "lat": 25.392921,
    "long": 51.422241,
    "speed": 9.74,
    "timestamp": "2020-08-25 11:42:54+00:00",
    "timestamp_unix": "1598355774"
  },
  {
    "lat": 25.392326,
    "long": 51.420597,
    "speed": 13.86,
    "timestamp": "2020-08-25 11:43:26+00:00",
    "timestamp_unix": "1598355806"
  },
  {
    "lat": 25.393848,
    "long": 51.419224,
    "speed": 9.35,
    "timestamp": "2020-08-25 11:43:53+00:00",
    "timestamp_unix": "1598355833"
  },
  {
    "lat": 25.395163,
    "long": 51.418339,
    "speed": 17.76,
    "timestamp": "2020-08-25 11:44:11+00:00",
    "timestamp_unix": "1598355851"
  },
  {
    "lat": 25.393738,
    "long": 51.41925,
    "speed": 4.06,
    "timestamp": "2020-08-25 11:44:46+00:00",
    "timestamp_unix": "1598355886"
  },
  {
    "lat": 25.392559,
    "long": 51.420036,
    "speed": 20.97,
    "timestamp": "2020-08-25 11:45:03+00:00",
    "timestamp_unix": "1598355903"
  },
  {
    "lat": 25.390835,
    "long": 51.421188,
    "speed": 24.42,
    "timestamp": "2020-08-25 11:45:22+00:00",
    "timestamp_unix": "1598355922"
  },
  {
    "lat": 25.385967,
    "long": 51.42432,
    "speed": 32.31,
    "timestamp": "2020-08-25 11:46:07+00:00",
    "timestamp_unix": "1598355967"
  },
  {
    "lat": 25.383842,
    "long": 51.425743,
    "speed": 34.13,
    "timestamp": "2020-08-25 11:46:23+00:00",
    "timestamp_unix": "1598355983"
  },
  {
    "lat": 25.382441,
    "long": 51.426682,
    "speed": 26.92,
    "timestamp": "2020-08-25 11:46:34+00:00",
    "timestamp_unix": "1598355994"
  },
  {
    "lat": 25.381187,
    "long": 51.427513,
    "speed": 26.19,
    "timestamp": "2020-08-25 11:46:50+00:00",
    "timestamp_unix": "1598356010"
  },
  {
    "lat": 25.37904,
    "long": 51.428944,
    "speed": 31.28,
    "timestamp": "2020-08-25 11:47:08+00:00",
    "timestamp_unix": "1598356028"
  },
  {
    "lat": 25.377419,
    "long": 51.430008,
    "speed": 31.94,
    "timestamp": "2020-08-25 11:47:21+00:00",
    "timestamp_unix": "1598356041"
  },
  {
    "lat": 25.376034,
    "long": 51.430904,
    "speed": 30.99,
    "timestamp": "2020-08-25 11:47:32+00:00",
    "timestamp_unix": "1598356052"
  },
  {
    "lat": 25.37439,
    "long": 51.429485,
    "speed": 35.44,
    "timestamp": "2020-08-25 11:47:53+00:00",
    "timestamp_unix": "1598356073"
  },
  {
    "lat": 25.371353,
    "long": 51.422878,
    "speed": 27.19,
    "timestamp": "2020-08-25 11:48:33+00:00",
    "timestamp_unix": "1598356113"
  },
  {
    "lat": 25.368502,
    "long": 51.423496,
    "speed": 35.68,
    "timestamp": "2020-08-25 11:49:43+00:00",
    "timestamp_unix": "1598356183"
  },
  {
    "lat": 25.366802,
    "long": 51.424965,
    "speed": 4.9,
    "timestamp": "2020-08-25 11:49:59+00:00",
    "timestamp_unix": "1598356199"
  },
  {
    "lat": 25.365385,
    "long": 51.425713,
    "speed": 28.28,
    "timestamp": "2020-08-25 11:50:16+00:00",
    "timestamp_unix": "1598356216"
  },
  {
    "lat": 25.363592,
    "long": 51.426334,
    "speed": 30.31,
    "timestamp": "2020-08-25 11:50:29+00:00",
    "timestamp_unix": "1598356229"
  },
  {
    "lat": 25.361549,
    "long": 51.427048,
    "speed": 29.66,
    "timestamp": "2020-08-25 11:50:45+00:00",
    "timestamp_unix": "1598356245"
  },
  {
    "lat": 25.359896,
    "long": 51.42762,
    "speed": 33.42,
    "timestamp": "2020-08-25 11:50:57+00:00",
    "timestamp_unix": "1598356257"
  },
  {
    "lat": 25.357458,
    "long": 51.428379,
    "speed": 33.44,
    "timestamp": "2020-08-25 11:51:13+00:00",
    "timestamp_unix": "1598356273"
  },
  {
    "lat": 25.354996,
    "long": 51.428635,
    "speed": 31.26,
    "timestamp": "2020-08-25 11:51:30+00:00",
    "timestamp_unix": "1598356290"
  },
  {
    "lat": 25.352493,
    "long": 51.428627,
    "speed": 28.48,
    "timestamp": "2020-08-25 11:51:47+00:00",
    "timestamp_unix": "1598356307"
  },
  {
    "lat": 25.350578,
    "long": 51.428677,
    "speed": 31.39,
    "timestamp": "2020-08-25 11:52:07+00:00",
    "timestamp_unix": "1598356327"
  },
  {
    "lat": 25.348858,
    "long": 51.429115,
    "speed": 34.82,
    "timestamp": "2020-08-25 11:52:18+00:00",
    "timestamp_unix": "1598356338"
  },
  {
    "lat": 25.347368,
    "long": 51.429657,
    "speed": 33.02,
    "timestamp": "2020-08-25 11:52:28+00:00",
    "timestamp_unix": "1598356348"
  },
  {
    "lat": 25.344654,
    "long": 51.430653,
    "speed": 35.79,
    "timestamp": "2020-08-25 11:52:46+00:00",
    "timestamp_unix": "1598356366"
  },
  {
    "lat": 25.342314,
    "long": 51.431511,
    "speed": 33.34,
    "timestamp": "2020-08-25 11:53:01+00:00",
    "timestamp_unix": "1598356381"
  },
  {
    "lat": 25.340679,
    "long": 51.431686,
    "speed": 18.71,
    "timestamp": "2020-08-25 11:53:17+00:00",
    "timestamp_unix": "1598356397"
  },
  {
    "lat": 25.338903,
    "long": 51.430943,
    "speed": 32.06,
    "timestamp": "2020-08-25 11:53:33+00:00",
    "timestamp_unix": "1598356413"
  },
  {
    "lat": 25.337509,
    "long": 51.430107,
    "speed": 35.37,
    "timestamp": "2020-08-25 11:53:43+00:00",
    "timestamp_unix": "1598356423"
  },
  {
    "lat": 25.336048,
    "long": 51.429234,
    "speed": 35.99,
    "timestamp": "2020-08-25 11:53:53+00:00",
    "timestamp_unix": "1598356433"
  },
  {
    "lat": 25.334423,
    "long": 51.428261,
    "speed": 36.06,
    "timestamp": "2020-08-25 11:54:04+00:00",
    "timestamp_unix": "1598356444"
  },
  {
    "lat": 25.332781,
    "long": 51.427151,
    "speed": 16.54,
    "timestamp": "2020-08-25 11:54:24+00:00",
    "timestamp_unix": "1598356464"
  },
  {
    "lat": 25.332569,
    "long": 51.428989,
    "speed": 26.17,
    "timestamp": "2020-08-25 11:54:41+00:00",
    "timestamp_unix": "1598356481"
  },
  {
    "lat": 25.332216,
    "long": 51.431259,
    "speed": 27.78,
    "timestamp": "2020-08-25 11:54:58+00:00",
    "timestamp_unix": "1598356498"
  },
  {
    "lat": 25.331772,
    "long": 51.434101,
    "speed": 28.56,
    "timestamp": "2020-08-25 11:55:18+00:00",
    "timestamp_unix": "1598356518"
  },
  {
    "lat": 25.331366,
    "long": 51.436047,
    "speed": 15.08,
    "timestamp": "2020-08-25 11:55:34+00:00",
    "timestamp_unix": "1598356534"
  },
  {
    "lat": 25.329847,
    "long": 51.435711,
    "speed": 19.82,
    "timestamp": "2020-08-25 11:55:50+00:00",
    "timestamp_unix": "1598356550"
  },
  {
    "lat": 25.328001,
    "long": 51.435371,
    "speed": 23.6,
    "timestamp": "2020-08-25 11:56:10+00:00",
    "timestamp_unix": "1598356570"
  },
  {
    "lat": 25.326061,
    "long": 51.435001,
    "speed": 20.12,
    "timestamp": "2020-08-25 11:56:38+00:00",
    "timestamp_unix": "1598356598"
  },
  {
    "lat": 25.32485,
    "long": 51.43594,
    "speed": 5.31,
    "timestamp": "2020-08-25 11:57:15+00:00",
    "timestamp_unix": "1598356635"
  },
  {
    "lat": 25.325125,
    "long": 51.439972,
    "speed": 14.78,
    "timestamp": "2020-08-25 14:15:56+00:00",
    "timestamp_unix": "1598364956"
  },
  {
    "lat": 25.325037,
    "long": 51.44178,
    "speed": 17.91,
    "timestamp": "2020-08-25 14:16:18+00:00",
    "timestamp_unix": "1598364978"
  },
  {
    "lat": 25.324949,
    "long": 51.44371,
    "speed": 15.22,
    "timestamp": "2020-08-25 14:16:44+00:00",
    "timestamp_unix": "1598365004"
  },
  {
    "lat": 25.324938,
    "long": 51.445255,
    "speed": 16.67,
    "timestamp": "2020-08-25 14:17:08+00:00",
    "timestamp_unix": "1598365028"
  },
  {
    "lat": 25.32432,
    "long": 51.447151,
    "speed": 24.81,
    "timestamp": "2020-08-25 14:17:32+00:00",
    "timestamp_unix": "1598365052"
  },
  {
    "lat": 25.322874,
    "long": 51.447411,
    "speed": 30.2,
    "timestamp": "2020-08-25 14:17:44+00:00",
    "timestamp_unix": "1598365064"
  },
  {
    "lat": 25.321352,
    "long": 51.447723,
    "speed": 2.11,
    "timestamp": "2020-08-25 14:18:02+00:00",
    "timestamp_unix": "1598365082"
  },
  {
    "lat": 25.319174,
    "long": 51.448833,
    "speed": 17.59,
    "timestamp": "2020-08-25 14:19:35+00:00",
    "timestamp_unix": "1598365175"
  },
  {
    "lat": 25.319704,
    "long": 51.451012,
    "speed": 20.68,
    "timestamp": "2020-08-25 14:19:56+00:00",
    "timestamp_unix": "1598365196"
  },
  {
    "lat": 25.319727,
    "long": 51.452778,
    "speed": 22.17,
    "timestamp": "2020-08-25 14:20:12+00:00",
    "timestamp_unix": "1598365212"
  },
  {
    "lat": 25.319674,
    "long": 51.454983,
    "speed": 10.3,
    "timestamp": "2020-08-25 14:20:38+00:00",
    "timestamp_unix": "1598365238"
  },
  {
    "lat": 25.318762,
    "long": 51.456512,
    "speed": 11.1,
    "timestamp": "2020-08-25 14:21:26+00:00",
    "timestamp_unix": "1598365286"
  },
  {
    "lat": 25.317377,
    "long": 51.456451,
    "speed": 15.39,
    "timestamp": "2020-08-25 14:21:52+00:00",
    "timestamp_unix": "1598365312"
  },
  {
    "lat": 25.317377,
    "long": 51.456451,
    "timestamp": "2020-08-25 14:22:32+00:00",
    "timestamp_unix": "1598365352"
  }
]
  private map: any;
  private originPlaceId = null;
  private destinationPlaceId = null;
  private travelMode = 'DRIVING';

  private directionsService: any;
  private directionsDisplay: any;
  private geocoder: any;

  // props use in this class for map
  private marker: any;
  private coordinates: any[] = [];
  private stopAnimationTimer: any;
  private markerAnimationDelyTime: any = 5000;
  private speedMarkerstopAnimationTimer: any;
  private bounds: any;
  private startFrom: number = 0;
  private animationStartIndex = 0;
  private animationReStartIndex: number = 0;

  @ViewChild('map') mapRef: ElementRef;


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {

    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      zoom: 14,
      center: { lat: 25.3548, lng: 51.1839 },
      mapTypeId:'roadmap'
    });

    var template = [
      '<?xml version="1.0"?>',
      '<svg width="26px" height="26px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">',
      '<circle stroke="#222" fill="{{ color }}" cx="50" cy="50" r="35"/>',
      '</svg>'
    ].join('\n');
    var svg = template.replace('{{ color }}', '#800');

     this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(25.316853, 51.456142),
       map: this.map,
       title: 'Dynamic SVG Marker',
       icon: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(20, 20) },
       optimized: false
    });

    for (var i = 0; i < this.response.length; i++) {
      this.coordinates.push(new google.maps.LatLng(this.response[i].lat, this.response[i].long));
    }

    //console.log(coordinates)
    debugger
    var flightPath = new google.maps.Polyline({
      path: this.coordinates,
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2
    });
    flightPath.setMap(this.map); 

    this.bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < this.coordinates.length; i++) {
      this.bounds.extend(this.coordinates[i]);
    }

    this.map.fitBounds(this.bounds);

  }

  animateMarker() {

    let i = this.animationStartIndex;
    this.stopAnimationTimer = setInterval(() => {

        let lat, long;
        lat = this.response[i].lat;
        long = this.response[i]?.long;

        let newLatLng = new google.maps.LatLng(lat,long );
        this.marker.setPosition(newLatLng);
        var point = this.marker.getPosition(); // Get marker position

        this.map.panTo(point); // Pan map to that position
        //this.zoomInAtMarker(this.marker);
      i++;
      if (this.response[i] == undefined) {
        clearInterval(this.stopAnimationTimer);
      }

      this.animationReStartIndex = i;

      }, this.markerAnimationDelyTime);



    this.map.fitBounds(this.bounds); // Back to default zoom
  }

  animate() { }

  stopAnimation() {
    clearInterval(this.stopAnimationTimer);
    clearInterval(this.speedMarkerstopAnimationTimer);
  }

  pauseAnimation() {
    clearInterval(this.stopAnimationTimer);
    clearInterval(this.speedMarkerstopAnimationTimer);
  }

  restartAnimation() {
    let j = this.animationReStartIndex;
    this.stopAnimationTimer = setInterval(() => {

      let lat, long;
      lat = this.response[j].lat;
      long = this.response[j]?.long;

      let newLatLng = new google.maps.LatLng(lat, long);
      this.marker.setPosition(newLatLng);
      var point = this.marker.getPosition(); // Get marker position

      this.map.panTo(point); // Pan map to that position
      //this.zoomInAtMarker(this.marker);
      j++;
      if (this.response[j] == undefined) {
        clearInterval(this.stopAnimationTimer);
      }
      this.animationReStartIndex = j;

    }, this.markerAnimationDelyTime);
  }

  speedMarkerAnimation() {
    let j = this.animationReStartIndex;
    this.speedMarkerstopAnimationTimer = setInterval(() => {

      let lat, long;
      lat = this.response[j].lat;
      long = this.response[j]?.long;

      let newLatLng = new google.maps.LatLng(lat, long);
      this.marker.setPosition(newLatLng);
      var point = this.marker.getPosition(); // Get marker position

      this.map.panTo(point); // Pan map to that position
      //this.zoomInAtMarker(this.marker);
      j++;
      if (this.response[j] == undefined) {
        clearInterval(this.stopAnimationTimer);
      }
      this.animationReStartIndex = j;

    }, this.markerAnimationDelyTime);
  }


  zoomInAtMarker(marker) {
    var pos = marker.getPosition();
    var bounds = this.map.getBounds();
    this.map.setZoom(this.map.getZoom() + 1);
    var span = this.map.getBounds().toSpan();
    var s = pos.lat() - span.lat() * (pos.lat() - bounds.getSouthWest().lat()) / bounds.toSpan().lat();
    var w = pos.lng() - span.lng() * (pos.lng() - bounds.getSouthWest().lng()) / bounds.toSpan().lng();
    this.map.panToBounds({ south: s, north: s + span.lat(), west: w, east: w + span.lng() });
  }

  speedMarkerMoment(speed) {
    this.stopAnimation();
    clearInterval(this.speedMarkerstopAnimationTimer);
    this.markerAnimationDelyTime = speed;
    this.speedMarkerAnimation();
  }





}
