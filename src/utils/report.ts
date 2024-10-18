export class ReportCheck {
  static reportErrorPass(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 2) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 3
        }
        report.json.threeD.eyes.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.errorList.length === 1) {
              delete report.json.threeD.eyes.total.errorList
            } else {
              report.json.threeD.eyes.total.errorList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyes.total.warnList !== undefined) {
          delete report.json.threeD.eyes.total.warnList.find((warn: any) => warn.id === obj.id).error
        }
        if (report.json.threeD.eyes.total.questionList !== undefined) {
          delete report.json.threeD.eyes.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
          }
          report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find((warn: any) => warn.id === obj.id)
              .error
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
          ) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
          }
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item: any, index: any) => {
              if (item.id === obj.id) {
                if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                } else {
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
                }
              }
            }
          )
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 2) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 3
        }
        report.json.threeD.eyesBak.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.errorList.length === 1) {
              delete report.json.threeD.eyesBak.total.errorList
            } else {
              report.json.threeD.eyesBak.total.errorList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyesBak.total.warnList !== undefined) {
          delete report.json.threeD.eyesBak.total.warnList.find((warn: any) => warn.id === obj.id).error
        }
        if (report.json.threeD.eyesBak.total.questionList !== undefined) {
          delete report.json.threeD.eyesBak.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        } else if (obj.areaPosition === "detail") {
          if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item: any, index: any) => {
              if (item.id === obj.id) {
                if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                } else {
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
                }
              }
            }
          )
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        if (report.json.xray.total.stepList[obj.id - 1].pass === 2) {
          report.json.xray.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.xray.total.stepList[obj.id - 1].pass === 4) {
          report.json.xray.total.stepList[obj.id - 1].pass = 3
        }
        report.json.xray.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.errorList.length === 1) {
              delete report.json.xray.total.errorList
            } else {
              report.json.xray.total.errorList.splice(index, 1)
            }
          }
        })
        if (report.json.xray.total.warnList !== undefined) {
          delete report.json.xray.total.warnList.find((warn: any) => warn.id === obj.id).error
        }
        if (report.json.xray.total.questionList !== undefined) {
          delete report.json.xray.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
          }
          report.json.xray.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.errorList
              } else {
                report.json.xray.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.warnList.find((warn: any) => warn.id === obj.id).error
          }
          if (report.json.xray.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.questionList.find((warn: any) => warn.id === obj.id)
              .error
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
          }
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1]
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    }
    return report
  }

  static reportErrorQuestion(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        if (report.json.threeD.eyes.total.questionList === undefined) {
          report.json.threeD.eyes.total["questionList"] = []
        }
        report.json.threeD.eyes.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 2) {
              const { error: question, ...rest } = report.json.threeD.eyes.total.errorList[index]
              const newObj = { question, ...rest }
              report.json.threeD.eyes.total.questionList.push(newObj)
            } else if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.threeD.eyes.total.errorList[index]
              report.json.threeD.eyes.total.questionList.find((qes: any) => qes.id === newObj.id).question.desc +=
                "\n" + newObj.error.desc
              report.json.threeD.eyes.total.questionList.find((qes: any) => qes.id === newObj.id).question.url =
                report.json.threeD.eyes.total.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
            }
            if (report.json.threeD.eyes.total.errorList.length === 1) {
              delete report.json.threeD.eyes.total.errorList
            } else {
              report.json.threeD.eyes.total.errorList.splice(index, 1)
            }
            report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 3
          }
        })
        if (report.json.threeD.eyes.total.warnList !== undefined) {
          delete report.json.threeD.eyes.total.warnList.find((warn: any) => warn.id === obj.id).error
          report.json.threeD.eyes.total.warnList.find((warn: any) => warn.id === obj.id).question =
            report.json.threeD.eyes.total.questionList.find((warn: any) => warn.id === obj.id).question
        }
        if (report.json.threeD.eyes.total.questionList !== undefined) {
          delete report.json.threeD.eyes.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.questionList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].general["questionList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
                const { error: question, ...rest } =
                  report.json.threeD.eyes.area[obj.areaId - 1].general.errorList[index]
                const newObj = { question, ...rest }
                report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.push(newObj)
              } else if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.threeD.eyes.area[obj.areaId - 1].general.errorList[index]
                report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.desc += "\n" + newObj.error.desc
                report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.url = report.json.threeD.eyes.area[obj.areaId - 1].general.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
              }
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
              report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find((warn: any) => warn.id === obj.id)
              .error
            report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find(
              (warn: any) => warn.id === obj.id
            ).question = report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1]["questionList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item: any, index: any) => {
              if (item.id === obj.id) {
                if (
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2
                ) {
                  const { error: question, ...rest } =
                    report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                  const newObj = { question, ...rest }
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.push(newObj)
                } else if (
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
                ) {
                  const newObj = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (qes: any) => qes.id === newObj.id
                  ).question.desc += "\n" + newObj.error.desc
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (qes: any) => qes.id === newObj.id
                  ).question.url = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                    .find((qes: any) => qes.id === newObj.id)
                    .question.url.concat(newObj.error.url)
                }
                if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                } else {
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
                }
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
              }
            }
          )
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).question = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        if (report.json.threeD.eyesBak.total.questionList === undefined) {
          report.json.threeD.eyesBak.total["questionList"] = []
        }
        report.json.threeD.eyesBak.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 2) {
              const { error: question, ...rest } = report.json.threeD.eyesBak.total.errorList[index]
              const newObj = { question, ...rest }
              report.json.threeD.eyesBak.total.questionList.push(newObj)
            } else if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.threeD.eyesBak.total.errorList[index]
              report.json.threeD.eyesBak.total.questionList.find((qes: any) => qes.id === newObj.id).question.desc +=
                "\n" + newObj.error.desc
              report.json.threeD.eyesBak.total.questionList.find((qes: any) => qes.id === newObj.id).question.url =
                report.json.threeD.eyesBak.total.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
            }
            if (report.json.threeD.eyesBak.total.errorList.length === 1) {
              delete report.json.threeD.eyesBak.total.errorList
            } else {
              report.json.threeD.eyesBak.total.errorList.splice(index, 1)
            }
            report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 3
          }
        })
        if (report.json.threeD.eyesBak.total.warnList !== undefined) {
          delete report.json.threeD.eyesBak.total.warnList.find((warn: any) => warn.id === obj.id).error
          report.json.threeD.eyesBak.total.warnList.find((warn: any) => warn.id === obj.id).question =
            report.json.threeD.eyesBak.total.questionList.find((warn: any) => warn.id === obj.id).question
        }
        if (report.json.threeD.eyesBak.total.questionList !== undefined) {
          delete report.json.threeD.eyesBak.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general["questionList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
                const { error: question, ...rest } =
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList[index]
                const newObj = { question, ...rest }
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.push(newObj)
              } else if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList[index]
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.desc += "\n" + newObj.error.desc
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.url = report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
              }
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
              report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
            }
          })
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find(
              (warn: any) => warn.id === obj.id
            ).question = report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1]["questionList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach(
            (item: any, index: any) => {
              if (item.id === obj.id) {
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  2
                ) {
                  const { error: question, ...rest } =
                    report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                  const newObj = { question, ...rest }
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.push(newObj)
                } else if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  4
                ) {
                  const newObj =
                    report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (qes: any) => qes.id === newObj.id
                  ).question.desc += "\n" + newObj.error.desc
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (qes: any) => qes.id === newObj.id
                  ).question.url = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                    .find((qes: any) => qes.id === newObj.id)
                    .question.url.concat(newObj.error.url)
                }
                if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                } else {
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
                }
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
              }
            }
          )
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).question = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        if (report.json.xray.total.questionList === undefined) {
          report.json.xray.total["questionList"] = []
        }
        report.json.xray.total.errorList.forEach((item: any, index: any) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.stepList[obj.id - 1].pass === 2) {
              const { error: question, ...rest } = report.json.xray.total.errorList[index]
              const newObj = { question, ...rest }
              report.json.xray.total.questionList.push(newObj)
            } else if (report.json.xray.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.xray.total.errorList[index]
              report.json.xray.total.questionList.find((qes: any) => qes.id === newObj.id).question.desc +=
                "\n" + newObj.error.desc
              report.json.xray.total.questionList.find((qes: any) => qes.id === newObj.id).question.url =
                report.json.xray.total.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
            }
            if (report.json.xray.total.errorList.length === 1) {
              delete report.json.xray.total.errorList
            } else {
              report.json.xray.total.errorList.splice(index, 1)
            }
            report.json.xray.total.stepList[obj.id - 1].pass = 3
          }
        })
        if (report.json.xray.total.warnList !== undefined) {
          delete report.json.xray.total.warnList.find((warn: any) => warn.id === obj.id).error
          report.json.xray.total.warnList.find((warn: any) => warn.id === obj.id).question =
            report.json.xray.total.questionList.find((warn: any) => warn.id === obj.id).question
        }
        if (report.json.xray.total.questionList !== undefined) {
          delete report.json.xray.total.questionList.find((warn: any) => warn.id === obj.id).error
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.xray.area[obj.areaId - 1].general.questionList === undefined) {
            report.json.xray.area[obj.areaId - 1].general["questionList"] = []
          }
          report.json.xray.area[obj.areaId - 1].general.errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2) {
                const { error: question, ...rest } = report.json.xray.area[obj.areaId - 1].general.errorList[index]
                const newObj = { question, ...rest }
                report.json.xray.area[obj.areaId - 1].general.questionList.push(newObj)
              } else if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.xray.area[obj.areaId - 1].general.errorList[index]
                report.json.xray.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.desc += "\n" + newObj.error.desc
                report.json.xray.area[obj.areaId - 1].general.questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.url = report.json.xray.area[obj.areaId - 1].general.questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
              }
              if (report.json.xray.area[obj.areaId - 1].general.errorList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.errorList
              } else {
                report.json.xray.area[obj.areaId - 1].general.errorList.splice(index, 1)
              }
              report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 3
            }
          })
          if (report.json.xray.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.warnList.find((warn: any) => warn.id === obj.id).error
            report.json.xray.area[obj.areaId - 1].general.warnList.find((warn: any) => warn.id === obj.id).question =
              report.json.xray.area[obj.areaId - 1].general.questionList.find(
                (warn: any) => warn.id === obj.id
              ).question
          }
          if (report.json.xray.area[obj.areaId - 1].general.questionList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.questionList.find((warn: any) => warn.id === obj.id)
              .error
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList === undefined) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1]["questionList"] = []
          }
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.forEach((item: any, index: any) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2) {
                const { error: question, ...rest } =
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                const newObj = { question, ...rest }
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.push(newObj)
              } else if (
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                const newObj = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList[index]
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.desc += "\n" + newObj.error.desc
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                  (qes: any) => qes.id === newObj.id
                ).question.url = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                  .find((qes: any) => qes.id === newObj.id)
                  .question.url.concat(newObj.error.url)
              }
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.splice(index, 1)
              }
              report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 3
            }
          })
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).error
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn: any) => warn.id === obj.id
            ).question = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).question
          }
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
              (warn: any) => warn.id === obj.id
            ).error
          }
        }
      }
    }
    return report
  }

  static reportQuestionPass(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 2
        }
        report.json.threeD.eyes.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.questionList.length === 1) {
              delete report.json.threeD.eyes.total.questionList
            } else {
              report.json.threeD.eyes.total.questionList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyes.total.warnList !== undefined) {
          delete report.json.threeD.eyes.total.warnList.find((warn) => warn.id === obj.id).question
        }
        if (report.json.threeD.eyes.total.errorList !== undefined) {
          delete report.json.threeD.eyes.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          }
          report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id)
              .question
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id)
              .question
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
          ) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          }
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 2
        }
        report.json.threeD.eyesBak.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.questionList.length === 1) {
              delete report.json.threeD.eyesBak.total.questionList
            } else {
              report.json.threeD.eyesBak.total.questionList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyesBak.total.warnList !== undefined) {
          delete report.json.threeD.eyesBak.total.warnList.find((warn) => warn.id === obj.id).question
        }
        if (report.json.threeD.eyesBak.total.errorList !== undefined) {
          delete report.json.threeD.eyesBak.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id)
              .question
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id)
              .question
          }
        } else if (obj.areaPosition === "detail") {
          if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          }

          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
            (item, index) => {
              if (item.id === obj.id) {
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                } else {
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
                }
              }
            }
          )
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        if (report.json.xray.total.stepList[obj.id - 1].pass === 3) {
          report.json.xray.total.stepList[obj.id - 1].pass = 1
        } else if (report.json.xray.total.stepList[obj.id - 1].pass === 4) {
          report.json.xray.total.stepList[obj.id - 1].pass = 2
        }
        report.json.xray.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.questionList.length === 1) {
              delete report.json.xray.total.questionList
            } else {
              report.json.xray.total.questionList.splice(index, 1)
            }
          }
        })
        if (report.json.xray.total.warnList !== undefined) {
          delete report.json.xray.total.warnList.find((warn) => warn.id === obj.id).question
        }
        if (report.json.xray.total.errorList !== undefined) {
          delete report.json.xray.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 1
          } else if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          }
          report.json.xray.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.questionList
              } else {
                report.json.xray.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id).question
          }
          if (report.json.xray.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id).question
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 1
          } else if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          }
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
          }
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    }
    return report
  }

  static reportQuestionError(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        if (report.json.threeD.eyes.total.errorList === undefined) {
          report.json.threeD.eyes.total["errorList"] = []
        }
        report.json.threeD.eyes.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3) {
              const { question: error, ...rest } = report.json.threeD.eyes.total.questionList[index]
              const newObj = { error, ...rest }
              report.json.threeD.eyes.total.errorList.push(newObj)
            } else if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.threeD.eyes.total.questionList[index]
              report.json.threeD.eyes.total.errorList.find((err) => err.id === newObj.id).error.desc +=
                "\n" + newObj.question.desc
              report.json.threeD.eyes.total.errorList.find((err) => err.id === newObj.id).error.url =
                report.json.threeD.eyes.total.errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
            }
            if (report.json.threeD.eyes.total.questionList.length === 1) {
              delete report.json.threeD.eyes.total.questionList
            } else {
              report.json.threeD.eyes.total.questionList.splice(index, 1)
            }
            report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 2
          }
        })
        if (report.json.threeD.eyes.total.warnList !== undefined) {
          delete report.json.threeD.eyes.total.warnList.find((warn) => warn.id === obj.id).question
          report.json.threeD.eyes.total.warnList.find((warn) => warn.id === obj.id).error =
            report.json.threeD.eyes.total.errorList.find((warn) => warn.id === obj.id).error
        }
        if (report.json.threeD.eyes.total.errorList !== undefined) {
          delete report.json.threeD.eyes.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
                const { question: error, ...rest } =
                  report.json.threeD.eyes.area[obj.areaId - 1].general.questionList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.push(newObj)
              } else if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.threeD.eyes.area[obj.areaId - 1].general.questionList[index]
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === newObj.id
                ).error.desc += "\n" + newObj.question.desc
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === newObj.id
                ).error.url = report.json.threeD.eyes.area[obj.areaId - 1].general.errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
              }
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
              report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id)
              .question
            report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id).error =
              report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id).error
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id)
              .question
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3
              ) {
                const { question: error, ...rest } =
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
              } else if (
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                const newObj = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === newObj.id
                ).error.desc += "\n" + newObj.question.desc
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === newObj.id
                ).error.url = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
              }
              if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
              }
              report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).error = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).error
          }
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        if (report.json.threeD.eyesBak.total.errorList === undefined) {
          report.json.threeD.eyesBak.total["errorList"] = []
        }
        report.json.threeD.eyesBak.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3) {
              const { question: error, ...rest } = report.json.threeD.eyesBak.total.questionList[index]
              const newObj = { error, ...rest }
              report.json.threeD.eyesBak.total.errorList.push(newObj)
            } else if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.threeD.eyesBak.total.questionList[index]
              report.json.threeD.eyesBak.total.errorList.find((err) => err.id === newObj.id).error.desc +=
                "\n" + newObj.question.desc
              report.json.threeD.eyesBak.total.errorList.find((err) => err.id === newObj.id).error.url =
                report.json.threeD.eyesBak.total.errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
            }
            if (report.json.threeD.eyesBak.total.questionList.length === 1) {
              delete report.json.threeD.eyesBak.total.questionList
            } else {
              report.json.threeD.eyesBak.total.questionList.splice(index, 1)
            }
            report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 2
          }
        })
        if (report.json.threeD.eyesBak.total.warnList !== undefined) {
          delete report.json.threeD.eyesBak.total.warnList.find((warn) => warn.id === obj.id).question
          report.json.threeD.eyesBak.total.warnList.find((warn) => warn.id === obj.id).error =
            report.json.threeD.eyesBak.total.errorList.find((warn) => warn.id === obj.id).error
        }
        if (report.json.threeD.eyesBak.total.errorList !== undefined) {
          delete report.json.threeD.eyesBak.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
                const { question: error, ...rest } =
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.push(newObj)
              } else if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList[index]
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === newObj.id
                ).error.desc += "\n" + newObj.question.desc
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === newObj.id
                ).error.url = report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
              }
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
              report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
            }
          })
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id)
              .question
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id).error =
              report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id).error
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id)
              .question
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach(
            (item, index) => {
              if (item.id === obj.id) {
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  3
                ) {
                  const { question: error, ...rest } =
                    report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                  const newObj = { error, ...rest }
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
                } else if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  4
                ) {
                  const newObj =
                    report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (err) => err.id === newObj.id
                  ).error.desc += "\n" + newObj.question.desc
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (err) => err.id === newObj.id
                  ).error.url = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                    .find((err) => err.id === newObj.id)
                    .error.url.concat(newObj.question.url)
                }
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
                } else {
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
                }
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
              }
            }
          )
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).error = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).error
          }
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        if (report.json.xray.total.errorList === undefined) {
          report.json.xray.total["errorList"] = []
        }
        report.json.xray.total.questionList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.stepList[obj.id - 1].pass === 3) {
              const { question: error, ...rest } = report.json.xray.total.questionList[index]
              const newObj = { error, ...rest }
              report.json.xray.total.errorList.push(newObj)
            } else if (report.json.xray.total.stepList[obj.id - 1].pass === 4) {
              const newObj = report.json.xray.total.questionList[index]
              report.json.xray.total.errorList.find((err) => err.id === newObj.id).error.desc +=
                "\n" + newObj.question.desc
              report.json.xray.total.errorList.find((err) => err.id === newObj.id).error.url =
                report.json.xray.total.errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
            }
            if (report.json.xray.total.questionList.length === 1) {
              delete report.json.xray.total.questionList
            } else {
              report.json.xray.total.questionList.splice(index, 1)
            }
            report.json.xray.total.stepList[obj.id - 1].pass = 2
          }
        })
        if (report.json.xray.total.warnList !== undefined) {
          delete report.json.xray.total.warnList.find((warn) => warn.id === obj.id).question
          report.json.xray.total.warnList.find((warn) => warn.id === obj.id).error =
            report.json.xray.total.errorList.find((warn) => warn.id === obj.id).error
        }
        if (report.json.xray.total.errorList !== undefined) {
          delete report.json.xray.total.errorList.find((warn) => warn.id === obj.id).question
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.xray.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.xray.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.xray.area[obj.areaId - 1].general.questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
                const { question: error, ...rest } = report.json.xray.area[obj.areaId - 1].general.questionList[index]
                const newObj = { error, ...rest }
                report.json.xray.area[obj.areaId - 1].general.errorList.push(newObj)
              } else if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4) {
                const newObj = report.json.xray.area[obj.areaId - 1].general.questionList[index]
                report.json.xray.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === newObj.id
                ).error.desc += "\n" + newObj.question.desc
                report.json.xray.area[obj.areaId - 1].general.errorList.find((err) => err.id === newObj.id).error.url =
                  report.json.xray.area[obj.areaId - 1].general.errorList
                    .find((err) => err.id === newObj.id)
                    .error.url.concat(newObj.question.url)
              }
              if (report.json.xray.area[obj.areaId - 1].general.questionList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.questionList
              } else {
                report.json.xray.area[obj.areaId - 1].general.questionList.splice(index, 1)
              }
              report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
            }
          })
          if (report.json.xray.area[obj.areaId - 1].general.warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id).question
            report.json.xray.area[obj.areaId - 1].general.warnList.find((warn) => warn.id === obj.id).error =
              report.json.xray.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id).error
          }
          if (report.json.xray.area[obj.areaId - 1].general.errorList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].general.errorList.find((warn) => warn.id === obj.id).question
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3) {
                const { question: error, ...rest } =
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                const newObj = { error, ...rest }
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
              } else if (
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                const newObj = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList[index]
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === newObj.id
                ).error.desc += "\n" + newObj.question.desc
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === newObj.id
                ).error.url = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                  .find((err) => err.id === newObj.id)
                  .error.url.concat(newObj.question.url)
              }
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.splice(index, 1)
              }
              report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
            }
          })
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).question
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.find(
              (warn) => warn.id === obj.id
            ).error = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).error
          }
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList !== undefined) {
            delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
              (warn) => warn.id === obj.id
            ).question
          }
        }
      }
    }
    return report
  }

  static reportWarnPass(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        report.json.threeD.eyes.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.warnList.length === 1) {
              delete report.json.threeD.eyes.total.warnList
            } else {
              report.json.threeD.eyes.total.warnList.splice(index, 1)
            }
            if (
              report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 2 ||
              report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.threeD.eyes.total.errorList.find((err) => err.id === obj.id).warn
            }
            if (
              report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3 ||
              report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.threeD.eyes.total.questionList.find((err) => err.id === obj.id).warn
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2 ||
                report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find((err) => err.id === obj.id)
                  .warn
              }
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                  (err) => err.id === obj.id
                ).warn
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2 ||
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === obj.id
                ).warn
              }
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                  (err) => err.id === obj.id
                ).warn
              }
            }
          })
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        report.json.threeD.eyesBak.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.warnList.length === 1) {
              delete report.json.threeD.eyesBak.total.warnList
            } else {
              report.json.threeD.eyesBak.total.warnList.splice(index, 1)
            }
            if (
              report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 2 ||
              report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.threeD.eyesBak.total.errorList.find((err) => err.id === obj.id).warn
            }
            if (
              report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3 ||
              report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.threeD.eyesBak.total.questionList.find((err) => err.id === obj.id).warn
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2 ||
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (err) => err.id === obj.id
                ).warn
              }
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                  (err) => err.id === obj.id
                ).warn
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  2 ||
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === obj.id
                ).warn
              }
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                  3 ||
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                  (err) => err.id === obj.id
                ).warn
              }
            }
          })
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        report.json.xray.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.warnList.length === 1) {
              delete report.json.xray.total.warnList
            } else {
              report.json.xray.total.warnList.splice(index, 1)
            }
            if (
              report.json.xray.total.stepList[obj.id - 1].pass === 2 ||
              report.json.xray.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.xray.total.errorList.find((err) => err.id === obj.id).warn
            }
            if (
              report.json.xray.total.stepList[obj.id - 1].pass === 3 ||
              report.json.xray.total.stepList[obj.id - 1].pass === 4
            ) {
              delete report.json.xray.total.questionList.find((err) => err.id === obj.id).warn
            }
          }
        })
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          report.json.xray.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.warnList
              } else {
                report.json.xray.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
              if (
                report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 2 ||
                report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.area[obj.areaId - 1].general.errorList.find((err) => err.id === obj.id).warn
              }
              if (
                report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.area[obj.areaId - 1].general.questionList.find((err) => err.id === obj.id).warn
              }
            }
          })
        } else if (obj.areaPosition === "detail") {
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
              if (
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 2 ||
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (err) => err.id === obj.id
                ).warn
              }
              if (
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3 ||
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                  (err) => err.id === obj.id
                ).warn
              }
            }
          })
        }
      }
    }
    return report
  }

  static reportWarnError(report: any, obj: any) {
    if (obj.type === "eyes") {
      if (obj.position === "total") {
        if (report.json.threeD.eyes.total.errorList === undefined) {
          report.json.threeD.eyes.total["errorList"] = []
        }
        report.json.threeD.eyes.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyes.total.errorList.find((error) => error.id === item.id) === undefined) {
              const { warn: error, ...rest } = report.json.threeD.eyes.total.warnList[index]
              const newObj = { error, ...rest }
              report.json.threeD.eyes.total.errorList.push(newObj)
              delete report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.threeD.eyes.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).error
              }
            } else {
              const newObj = report.json.threeD.eyes.total.warnList[index]
              report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).error.desc +=
                "\n制程警示：" + newObj.warn.desc
              report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).error.url =
                report.json.threeD.eyes.total.errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
              delete report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyes.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.threeD.eyes.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.threeD.eyes.total.errorList.find((item) => item.id === newObj.id).error
              }
            }
            if (report.json.threeD.eyes.total.warnList.length === 1) {
              delete report.json.threeD.eyes.total.warnList
            } else {
              report.json.threeD.eyes.total.warnList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 1) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 2
        } else if (report.json.threeD.eyes.total.stepList[obj.id - 1].pass === 3) {
          report.json.threeD.eyes.total.stepList[obj.id - 1].pass = 4
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find((error) => error.id === item.id) ===
                undefined
              ) {
                const { warn: error, ...rest } = report.json.threeD.eyes.area[obj.areaId - 1].general.warnList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.push(newObj)
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.threeD.eyes.area[obj.areaId - 1].general.warnList[index]
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.threeD.eyes.area[obj.areaId - 1].general.errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyes.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyes.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].general.warnList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 1) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          } else if (report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.threeD.eyes.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 4
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (error) => error.id === item.id
                ) === undefined
              ) {
                const { warn: error, ...rest } =
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    3 ||
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    3 ||
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 1) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          } else if (
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3
          ) {
            report.json.threeD.eyes.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 4
          }
        }
      }
    } else if (obj.type === "eyesBak") {
      if (obj.position === "total") {
        if (report.json.threeD.eyesBak.total.errorList === undefined) {
          report.json.threeD.eyesBak.total["errorList"] = []
        }
        report.json.threeD.eyesBak.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.threeD.eyesBak.total.errorList.find((error) => error.id === item.id) === undefined) {
              const { warn: error, ...rest } = report.json.threeD.eyesBak.total.warnList[index]
              const newObj = { error, ...rest }
              report.json.threeD.eyesBak.total.errorList.push(newObj)
              delete report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.threeD.eyesBak.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).error
              }
            } else {
              const newObj = report.json.threeD.eyesBak.total.warnList[index]
              report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).error.desc +=
                "\n制程警示：" + newObj.warn.desc
              report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).error.url =
                report.json.threeD.eyesBak.total.errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
              delete report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3 ||
                report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.threeD.eyesBak.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.threeD.eyesBak.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.threeD.eyesBak.total.errorList.find((item) => item.id === newObj.id).error
              }
            }
            if (report.json.threeD.eyesBak.total.warnList.length === 1) {
              delete report.json.threeD.eyesBak.total.warnList
            } else {
              report.json.threeD.eyesBak.total.warnList.splice(index, 1)
            }
          }
        })
        if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 1) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 2
        } else if (report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass === 3) {
          report.json.threeD.eyesBak.total.stepList[obj.id - 1].pass = 4
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (error) => error.id === item.id
                ) === undefined
              ) {
                const { warn: error, ...rest } = report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.push(newObj)
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList[index]
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyesBak.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyesBak.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
            }
          })
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 1) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          } else if (report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 4
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (error) => error.id === item.id
                ) === undefined
              ) {
                const { warn: error, ...rest } =
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                const newObj = { error, ...rest }
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    3 ||
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    4
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    3 ||
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass ===
                    4
                ) {
                  delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
            }
          })
          if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 1
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          } else if (
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3
          ) {
            report.json.threeD.eyesBak.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 4
          }
        }
      }
    } else if (obj.type === "xray") {
      if (obj.position === "total") {
        if (report.json.xray.total.errorList === undefined) {
          report.json.xray.total["errorList"] = []
        }
        report.json.xray.total.warnList.forEach((item, index) => {
          if (item.id === obj.id) {
            if (report.json.xray.total.errorList.find((error) => error.id === item.id) === undefined) {
              const { warn: error, ...rest } = report.json.xray.total.warnList[index]
              const newObj = { error, ...rest }
              report.json.xray.total.errorList.push(newObj)
              delete report.json.xray.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.xray.total.stepList[obj.id - 1].pass === 3 ||
                report.json.xray.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.xray.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.xray.total.errorList.find((item) => item.id === newObj.id).error
              }
            } else {
              const newObj = report.json.xray.total.warnList[index]
              report.json.xray.total.errorList.find((item) => item.id === newObj.id).error.desc +=
                "\n制程警示：" + newObj.warn.desc
              report.json.xray.total.errorList.find((item) => item.id === newObj.id).error.url =
                report.json.xray.total.errorList.find((item) => item.id === newObj.id).error.url.concat(newObj.warn.url)
              delete report.json.xray.total.errorList.find((item) => item.id === newObj.id).warn
              if (
                report.json.xray.total.stepList[obj.id - 1].pass === 3 ||
                report.json.xray.total.stepList[obj.id - 1].pass === 4
              ) {
                delete report.json.xray.total.questionList.find((item) => item.id === newObj.id).warn
                report.json.xray.total.questionList.find((item) => item.id === newObj.id).error =
                  report.json.xray.total.errorList.find((item) => item.id === newObj.id).error
              }
            }
            if (report.json.xray.total.warnList.length === 1) {
              delete report.json.xray.total.warnList
            } else {
              report.json.xray.total.warnList.splice(index, 1)
            }
          }
        })
        if (report.json.xray.total.stepList[obj.id - 1].pass === 1) {
          report.json.xray.total.stepList[obj.id - 1].pass = 2
        } else if (report.json.xray.total.stepList[obj.id - 1].pass === 3) {
          report.json.xray.total.stepList[obj.id - 1].pass = 4
        }
      } else if (obj.position === "area") {
        if (obj.areaPosition === "general") {
          if (report.json.xray.area[obj.areaId - 1].general.errorList === undefined) {
            report.json.xray.area[obj.areaId - 1].general["errorList"] = []
          }
          report.json.xray.area[obj.areaId - 1].general.warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.xray.area[obj.areaId - 1].general.errorList.find((error) => error.id === item.id) ===
                undefined
              ) {
                const { warn: error, ...rest } = report.json.xray.area[obj.areaId - 1].general.warnList[index]
                const newObj = { error, ...rest }
                report.json.xray.area[obj.areaId - 1].general.errorList.push(newObj)
                delete report.json.xray.area[obj.areaId - 1].general.errorList.find((item) => item.id === newObj.id)
                  .warn
                if (
                  report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.xray.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.xray.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.xray.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.xray.area[obj.areaId - 1].general.warnList[index]
                report.json.xray.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.xray.area[obj.areaId - 1].general.errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.xray.area[obj.areaId - 1].general.errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.xray.area[obj.areaId - 1].general.errorList.find((item) => item.id === newObj.id)
                  .warn
                if (
                  report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3 ||
                  report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.xray.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.xray.area[obj.areaId - 1].general.questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.xray.area[obj.areaId - 1].general.errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.xray.area[obj.areaId - 1].general.warnList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].general.warnList
              } else {
                report.json.xray.area[obj.areaId - 1].general.warnList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 1) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 2
          } else if (report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass === 3) {
            report.json.xray.area[obj.areaId - 1].general.stepList[obj.id - 1].pass = 4
          }
        } else if (obj.areaPosition === "detail") {
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList === undefined) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1]["errorList"] = []
          }
          report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.forEach((item, index) => {
            if (item.id === obj.id) {
              if (
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (error) => error.id === item.id
                ) === undefined
              ) {
                const { warn: error, ...rest } =
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                const newObj = { error, ...rest }
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.push(newObj)
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3 ||
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              } else {
                const newObj = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList[index]
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.desc += "\n制程警示：" + newObj.warn.desc
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).error.url = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList
                  .find((item) => item.id === newObj.id)
                  .error.url.concat(newObj.warn.url)
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                  (item) => item.id === newObj.id
                ).warn
                if (
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3 ||
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 4
                ) {
                  delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).warn
                  report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].questionList.find(
                    (item) => item.id === newObj.id
                  ).error = report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].errorList.find(
                    (item) => item.id === newObj.id
                  ).error
                }
              }
              if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.length === 1) {
                delete report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList
              } else {
                report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].warnList.splice(index, 1)
              }
            }
          })
          if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 1) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 2
          } else if (report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass === 3) {
            report.json.xray.area[obj.areaId - 1].detail[obj.detailId - 1].stepList[obj.id - 1].pass = 4
          }
        }
      }
      return report
    }
  }
}

