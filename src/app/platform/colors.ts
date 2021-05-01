export abstract class Colors {
  public static readonly GRAY_DARKER = '#262626';
  public static readonly GRAY_DARK = '#2d2d2d';
  public static readonly GRAY = '#383838';
  public static readonly GRAY_LIGHT = '#444444';
  public static readonly GRAY_LIGHTER = '#5c5c5c';

  public static readonly BRAND_PRIMARY = '#2d99dc';
  public static readonly BRAND_INFO = '#35bda8';
  public static readonly BRAND_SUCCESS = '#86b34d';
  public static readonly BRAND_WARNING = '#e66c40';
  public static readonly BRAND_DANGER = '#cb3e4b';

  public static readonly BRAND_CERULEAN = '#08a5e1';
  public static readonly BRAND_CURIOUS_BLUE = '#08a5e1';
  public static readonly BRAND_ENDAVEOUR = '#0058a1';
  public static readonly BRAND_MINSK = '#343286';
  public static readonly BRAND_EMINENCE = '#732c86';
  public static readonly BRAND_VIOLET_EGGPLANT = '#a82084';
  public static readonly BRAND_MINT_FREEN = '#78fd9a';
  public static readonly BRAND_AQUAMARINE = '#68fee0';
  public static readonly BRAND_MALIBU = '#6bc1fd';
  public static readonly BRAND_DODGER_BLUE = '#5b73fc';
  public static readonly BRAND_HELIOTROPE = '#a072fc';


  public static readonly DARK_PURPLE = '#9B59B6';
  public static readonly INDIAN_RED = '#CD5C5C';
  public static readonly LIGHT_CORAL = '#F08080';
  public static readonly SALMON = '#FA8072';
  public static readonly MEDIUM_VIOLET_RED = '#C71585';
  public static readonly DARK_ORANGE = '#FF8C00';
  public static readonly MEDIUM_SEA_GREEN = '#3CB371';
  public static readonly MAGENTA = '#FF00FF';
  public static readonly CRIMSON = '#DC143C';


  public static readonly DEEPSKYBLUE = '#00BFFF';
  public static readonly MEDIUMBLUE = '#0000CD';
  public static readonly POWDERBLUE = '#B0E0E6';
  public static readonly DARKTURQUOISE = '#00CED1';
  public static readonly AQUA = '#00FFFF';
  public static readonly DARKCYAN = '#008B8B';
  public static readonly SEAGREEN = '#2E8B57';
  public static readonly MEDIUMSLATEBLUE = '#7B68EE';


  public static getColors(index?): any {
    const array = [
      'darkorange',
      'forestgreen',
      'steelblue',
      'crimson',
      'mediumpurple',
      'turquoise',
      Colors.BRAND_AQUAMARINE,
      Colors.BRAND_CERULEAN,
      Colors.BRAND_CURIOUS_BLUE,
      Colors.BRAND_ENDAVEOUR,
      Colors.BRAND_MINSK,
      Colors.BRAND_EMINENCE,
      Colors.BRAND_VIOLET_EGGPLANT,
      Colors.BRAND_MINT_FREEN,
      Colors.BRAND_MALIBU,
      Colors.BRAND_DODGER_BLUE,
      Colors.BRAND_HELIOTROPE,
      Colors.BRAND_PRIMARY,
      Colors.BRAND_INFO,
      Colors.BRAND_SUCCESS,
      Colors.BRAND_WARNING,
      Colors.BRAND_DANGER,
      Colors.DARK_PURPLE,
      Colors.LIGHT_CORAL,
      Colors.INDIAN_RED,
      Colors.SALMON,
      Colors.CRIMSON,
      Colors.MEDIUM_VIOLET_RED,
      Colors.DARK_ORANGE,
      Colors.MAGENTA,
      Colors.MEDIUM_SEA_GREEN,
      Colors.DEEPSKYBLUE,
      Colors.MEDIUMBLUE,
      Colors.POWDERBLUE,
      Colors.DARKTURQUOISE,
      Colors.AQUA,
      Colors.DARKCYAN,
      Colors.SEAGREEN,
      Colors.MEDIUMSLATEBLUE,
    ];

    if (index) {
      return array[index];
    } else {
      return array;
    }
  }
}
