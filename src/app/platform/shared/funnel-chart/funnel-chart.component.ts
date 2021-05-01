import { Component } from '@angular/core';

@Component({
  selector: 'app-funnel-chart',
  templateUrl: './funnel-chart.component.html',
  styleUrls: ['./funnel-chart.component.css']
})
export class FunnelChartComponent {

  title: string;
  dataSource1: any;
  dataSource: any;
  type1: string;
  type: string;
  width: string;
  height: string;
  chart: any;
  events1: any;
  events: any;
  chartInstance: any = {};

  data = {
    chart: {
      caption: "Website visits",
      subcaption: "Purchase - Conversion analysis for last year",
      decimals: "1",
      showvalues: "1",
      plottooltext: "$label: <b>$dataValue</b>",
      plotfillalpha: "70",
      theme: "fusion",
      streamlineddata: "0"
    },
    data: [
      {
        label: "Website Visits",
        value: "17362"
      },
      {
        label: "Downloads",
        value: "8039"
      },
      {
        label: "Checked Pricing",
        value: "5509"
      },
      {
        label: "Asked for Quotation",
        value: "3962"
      },
      {
        label: "Purchased",
        value: "2397"
      }
    ]
  };
  constructor() {
    this.type1 = "gantt";
    this.type = "funnel";
    this.width = "100%";
    this.height = "400";
    this.dataSource1 = {
      chart: {
        theme: "fusion",
        dateformat: "mm/dd/yyyy",
        caption: "Social Media Optimization",
        subcaption: "Project Plan",
        chartbottomMargin: "90",
        showLabel: "0"
      },
      categories: [
        {
          category: [
            {
              start: "08/01/2014",
              end: "08/31/2014",
              label: "Aug '14"
            },
            {
              start: "09/01/2014",
              end: "09/30/2014",
              label: "Sep '14"
            },
            {
              start: "10/01/2014",
              end: "10/31/2014",
              label: "Oct '14"
            },
            {
              start: "11/01/2014",
              end: "11/30/2014",
              label: "Nov '14"
            },
            {
              start: "12/01/2014",
              end: "12/31/2014",
              label: "Dec '14"
            },
            {
              start: "01/01/2015",
              end: "01/31/2015",
              label: "Jan '15"
            },
            {
              start: "02/01/2015",
              end: "02/28/2015",
              label: "Feb '15"
            },
            {
              start: "03/01/2015",
              end: "03/31/2015",
              label: "Mar '15"
            }
          ]
        }
      ],
      processes: {
        fontsize: "12",
        isbold: "1",
        align: "left",
        process: [
          {
            id: "PROCESS_1",
            label: "Identify Customers"
          },
          {
            id: "PROCESS_2",
            label: "Survey 500 Customers"
          },
          {
            id: "PROCESS_3",
            label: "Interpret Requirements"
          },
          {
            id: "PROCESS_4",
            label: "Market Analysis"
          },
          {
            id: "PROCESS_5",
            label: "Brainstorm concepts"
          },
          {
            id: "PROCESS_6",
            label: "Define Ad Requirements"
          },
          {
            id: "PROCESS_7",
            label: "Design And Develop"
          },
          {
            id: "PROCESS_8",
            label: "Mock test"
          },
          {
            id: "PROCESS_9",
            label: "Documentation"
          },
          {
            id: "PROCESS_10",
            label: "Start Campaign"
          }
        ]
      },
      tasks: {
        task: [
          {
            id: "1",
            start: "08/04/2014",
            end: "08/10/2014",
            label: "test"
          },
          {
            id: "2",
            start: "08/08/2014",
            end: "08/19/2014"
          },
          {
            id: "3",
            start: "08/19/2014",
            end: "09/02/2014"
          },
          {
            id: "4",
            start: "08/24/2014",
            end: "09/02/2014"
          },
          {
            id: "5",
            start: "09/02/2014",
            end: "09/21/2014"
          },
          {
            id: "6",
            start: "09/21/2014",
            end: "10/06/2014"
          },
          {
            id: "7",
            start: "10/06/2014",
            end: "01/21/2015"
          },
          {
            id: "8",
            start: "01/21/2015",
            end: "02/19/2015"
          },
          {
            id: "9",
            start: "01/28/2015",
            end: "02/24/2015"
          },
          {
            id: "10",
            start: "02/24/2015",
            end: "03/27/2015"
          }
        ]
      },
      connectors: [
        {
          connector: [
            {
              fromtaskid: "2",
              totaskid: "3",
              color: "#008ee4",
              thickness: "2"
            },
            {
              fromtaskid: "4",
              totaskid: "5",
              color: "#008ee4",
              thickness: "2"
            },
            {
              fromtaskid: "5",
              totaskid: "6",
              color: "#008ee4",
              thickness: "2"
            },
            {
              fromtaskid: "6",
              totaskid: "7",
              color: "#008ee4",
              thickness: "2"
            },
            {
              fromtaskid: "7",
              totaskid: "8",
              color: "#008ee4",
              thickness: "2"
            },
            {
              fromtaskid: "9",
              totaskid: "10",
              color: "#008ee4",
              thickness: "2"
            }
          ]
        }
      ],
      milestones: {
        milestone: [
          {
            date: "3/28/2015",
            taskid: "10",
            color: "#f8bd19",
            shape: "star",
            tooltext: "Completion of First Campaign"
          }
        ]
      }
    };
    this.dataSource = {
      chart: {
        caption: "Website - Harry's SuperMart",
        subcaption: "Visit to purchase - Conversion analysis for last year",
        decimals: "1",
        isHollow: "1",
        labelDistance: "15",
        is2D: "1",
        plotTooltext: "Success : $percentOfPrevValue",
        showPercentValues: "1",
        theme: "fusion",
        enableSlicing: "0"
      },
      data: [
        {
          label: "Unique Website Visits",
          value: "1460000"
        },
        {
          label: "Programme Details Section Visits",
          value: "930000"
        },
        {
          label: "Attempts to Register",
          value: "540000"
        },
        {
          label: "Successful Registrations",
          value: "210000"
        },
        {
          label: "Logged In",
          value: "190000"
        },
        {
          label: "Purchased on Introductory Offers",
          value: "120000"
        }
      ]
    };
    this.events1 = {
      dataPlotClick: function (e) {
        console.log(e);
      }
    };
    this.events = {
      dataPlotClick: function (e) {
        console.log(e);
      }
    };
  }

}
