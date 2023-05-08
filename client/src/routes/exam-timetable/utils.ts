type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export function checkOverlap(
  current: {
    exam: API.SchedulerExam['exam'] | API.Exam | null;
    weekday: WeekdayShort;
    period: number;
    size: number;
  },
  schedule: {
    id: string;
    exam: API.SchedulerExam['exam'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[] = [],
  overlapData = true,
) {
  const sharedData = schedule.filter((obj) => {
    return (
      obj.exam.room?.id == current.exam?.room?.id ||
      obj.exam.instructor.findIndex(
        (inst) => current.exam?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
      ) !== -1 ||
      obj.exam.section.findIndex(
        (sect) =>
          current.exam?.section.findIndex(
            (sec) => sec.id === sect.id || sec.group?.id === sect.group?.id,
          ) !== -1,
      ) !== -1
    );
  });

  const overlap = sharedData.filter(
    (item) =>
      item.weekday == current.weekday &&
      item.period + item.size > current.period &&
      item.period < current.period + current.size,
  );

  return {
    isOverlap: overlap.length > 0,
    allowOverlap: false,
    overlapRoom:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => obj.exam.room?.id == current.exam?.room?.id)
        : [],
    overlapInstructor:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => {
            return (
              obj.exam.instructor.findIndex(
                (inst) => current.exam?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
              ) !== -1
            );
          })
        : [],
    overlapSection:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => {
            return (
              obj.exam.section.findIndex(
                (sect) => current.exam?.section.findIndex((sec) => sec.id === sect.id) !== -1,
              ) !== -1
            );
          })
        : [],
    overlapGroup:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => {
            return (
              obj.exam.section.findIndex(
                (sect) =>
                  current.exam?.section.findIndex((sec) => sec.group?.id === sect.group?.id) !== -1,
              ) !== -1
            );
          })
        : [],
  };
}
