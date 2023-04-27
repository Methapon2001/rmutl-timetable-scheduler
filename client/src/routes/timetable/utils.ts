type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export function checkOverlap(
  current: {
    section: API.Scheduler['section'] | API.Section['child'][number] | null;
    weekday: WeekdayShort;
    period: number;
    size: number;
  },
  schedule: {
    id: string;
    section: API.Scheduler['section'];
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[] = [],
  overlapData = true,
) {
  const sharedData = schedule.filter((obj) => {
    return (
      obj.section.room?.id == current.section?.room?.id ||
      obj.section.group?.id == current.section?.group?.id ||
      obj.section.instructor.findIndex(
        (inst) => current.section?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
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
    allowOverlap:
      overlap.length > 0
        ? !overlap.some((obj) => {
            return (
              obj.section.subject.id == current.section?.subject.id ||
              obj.section.room?.id == current.section?.room?.id ||
              obj.section.instructor.findIndex(
                (inst) => current.section?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
              ) !== -1
            );
          })
        : true,
    overlapInstructor:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => {
            return (
              obj.section.instructor.findIndex(
                (inst) => current.section?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
              ) !== -1
            );
          })
        : [],
    overlapSubject:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => obj.section.subject.id == current.section?.subject.id)
        : [],
    overlapRoom:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => obj.section.room?.id == current.section?.room?.id)
        : [],
    overlapGroup:
      overlap.length > 0 && overlapData
        ? overlap.filter((obj) => obj.section.group?.id == current.section?.group?.id)
        : [],
  };
}
