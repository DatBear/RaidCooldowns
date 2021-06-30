import Report from "../models/response/Report";

class WarcraftLogsService {
  baseUrl: string;

  constructor(isDebug: boolean){
    this.baseUrl = isDebug ? "https://localhost:3001" : "http://datbear.com/wow/raidcds_server";
  }

  private request<T>(url: string) : Promise<T>{
    return fetch(url).then(res => {
      if(!res.ok){
        throw new Error(res.statusText);
      }
      return res.json() as Promise<T>;
    })
  }

  //@todo make this use code
  getReportData(code: string){
    return this.request<Report>(`${this.baseUrl}/report/${code}`);
  }
}

export default WarcraftLogsService;