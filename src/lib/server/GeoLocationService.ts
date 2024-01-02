import "server-only";
import { IP2Location, IPTools } from "ip2location-nodejs";
import getConfig from "next/config";

class GeoLocationService {
  private static ipV4LocationService: IP2Location;
  private static ipV6LocationService: IP2Location;
  private static ipTools: IPTools;

  private static async initService() {
    var path = require("path");
    const { serverRuntimeConfig } = getConfig();

    if (!this.ipV4LocationService) {
      this.ipV4LocationService = new IP2Location();
      this.ipV4LocationService.open(
        path.join(serverRuntimeConfig.PROJECT_ROOT, "resources/ip-db/IP2LOCATION-LITE-DB3.BIN"),
      );

      if (!this.ipV4LocationService.loadBin()) console.log("Failed to open ipv4 geo database.");
    }
    if (!this.ipV6LocationService) {
      this.ipV6LocationService = new IP2Location();
      this.ipV6LocationService.open(
        path.join(serverRuntimeConfig.PROJECT_ROOT, "resources/ip-db/IP2LOCATION-LITE-DB3.IPV6.BIN"),
      );

      if (!this.ipV6LocationService.loadBin()) console.log("Failed to open ipv6 geo database.");
    }

    if (!this.ipTools) {
      this.ipTools = new IPTools();
    }
  }

  public static async getCountry(ip: string) {
    let countryCode: string = "N/A";

    this.initService();

    if (this.ipTools.isIPV4(ip)) {
      if (this.ipV4LocationService.loadBin()) countryCode = this.ipV4LocationService.getCountryShort(ip);
    } else if (this.ipTools.isIPV6(ip)) {
      if (this.ipV6LocationService.loadBin()) countryCode = this.ipV6LocationService.getCountryShort(ip);
    }
    if (countryCode === "-") countryCode = "N/A";

    return countryCode;
  }
}

export default GeoLocationService;
