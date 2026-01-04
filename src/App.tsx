import { useState } from "react";
import {
  parse,
  isValid,
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  getWeek,
  getYear,
  differenceInWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  getISOWeeksInYear,
} from "date-fns";
import { ro } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeSwitcher } from "./components/theme-switcher";

const DATE_FORMATS = [
  "dd.MM.yyyy",
  "dd-MM-yyyy",
  "dd/MM/yyyy",
  "d.M.yyyy",
  "d-M-yyyy",
  "d/M/yyyy",
  "dd MMMM yyyy",
  "d MMMM yyyy",
  "yyyy-MM-dd",
  "yyyy/MM/dd",
];

function parseFlexibleDate(value: string): Date | null {
  for (const format of DATE_FORMATS) {
    const parsed = parse(value, format, new Date(), { locale: ro });
    if (isValid(parsed)) return parsed;
  }
  return null;
}

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    if (!inputValue) return;

    const parsed = parseFlexibleDate(inputValue.trim());
    if (parsed) {
      setSelectedDate(parsed);
      setInputValue("");
      setError(null);
    } else {
      setError("Invalid date. Please use a valid format.");
    }
  };

  const currentWeek = getWeek(selectedDate, { weekStartsOn: 1 });
  const currentYear = getYear(selectedDate);
  const totalWeeksInYear = getISOWeeksInYear(selectedDate);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const years = differenceInYears(today, selectedDate);
  const remainingAfterYears = new Date(selectedDate);
  remainingAfterYears.setFullYear(remainingAfterYears.getFullYear() + years);

  const months = differenceInMonths(today, remainingAfterYears);
  const remainingAfterMonths = new Date(remainingAfterYears);
  remainingAfterMonths.setMonth(remainingAfterMonths.getMonth() + months);

  const days = differenceInDays(today, remainingAfterMonths);
  const weeks = differenceInWeeks(today, selectedDate);
  const totalDays = differenceInDays(today, selectedDate);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Time passed since</h1>
          <p className="text-gray-400">
            Explore time passed since {format(selectedDate, 'dd-MM-yyyy')} until {format(today, 'dd-MM-yyyy')} <ThemeSwitcher />
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Search Date</CardTitle>
            <CardDescription>
              Enter a date manually or select from calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              {/* Manual Input */}
              <div className="flex flex-col flex-1">
                <Popover open={!!error} onOpenChange={() => setError(null)}>
                  <PopoverTrigger asChild>
                    <Input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Enter date (dd.MM.yyyy, dd/MM/yyyy, etc.)"
                      className="flex-1 h-full !text-sm py-2"
                      onBlur={() => {
                        if (!inputValue) return;
                        const parsed = parseFlexibleDate(inputValue.trim());
                        if (parsed) {
                          setInputValue(format(parsed, "dd.MM.yyyy"));
                          setError(null);
                        }
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch}>Search</Button>
              {/* Calendar Button */}
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Calendar</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setInputValue("");
                        setIsOpen(false);
                        setError(null);
                      }
                    }}
                    locale={ro}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>

            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Period</CardTitle>
                <CardDescription>
                  From {format(selectedDate, "dd MMMM yyyy", { locale: ro })} to today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-700">
                  <span className="font-bold text-indigo-600">{years}</span> years,{" "}
                  <span className="font-bold text-purple-600">{months}</span> months,{" "}
                  <span className="font-bold text-green-600">{days}</span> days
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">Years</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{years}</p>
                  <p className="text-xs text-gray-500 mt-1">years passed</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Months</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{months}</p>
                  <p className="text-xs text-gray-500 mt-1">additional months</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Weeks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{weeks}</p>
                  <p className="text-xs text-gray-500 mt-1">total weeks</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{totalDays}</p>
                  <p className="text-xs text-gray-500 mt-1">total days</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Week Info Card */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Week {currentWeek}</CardTitle>
                <CardDescription className="">
                  {currentYear} · {format(weekDays[0], "dd MMMM", { locale: ro })} -{" "}
                  {format(weekDays[6], "dd MMMM yyyy", { locale: ro })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePrevWeek} variant="ghost" size="icon">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button onClick={handleToday} variant="ghost">
                  Today
                </Button>
                <Button onClick={handleNextWeek} variant="ghost" size="icon">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-8">
          {weekDays.map((day, index) => {
            const dayCompare = new Date(day);
            dayCompare.setHours(0, 0, 0, 0);
            const selectedCompare = new Date(selectedDate);
            selectedCompare.setHours(0, 0, 0, 0);
            const isToday = dayCompare.getTime() === today.getTime();
            const isSelected = dayCompare.getTime() === selectedCompare.getTime();
            const dayName = format(day, "EEEE", { locale: ro });
            const dayDate = format(day, "dd");
            const monthName = format(day, "MMMM", { locale: ro });

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDate(day);
                  setInputValue(format(day, "dd.MM.yyyy"));
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-4 bg-card rounded-lg min-h-[120px] relative cursor-pointer transition-all
                   ${isSelected ?
                    "ring-2 ring-primary " :
                    isToday
                      ? "bg-gradient-to-b from-green-400 to-green-500 border-green-600 border-2"
                      : "hover:border-1 hover:border-primary"}`}
              >
                <div className="text-sm font-medium mb-1">
                  {dayName}
                </div>
                <div className="text-3xl font-bold mb-1">
                  {dayDate}
                </div>
                <div className="text-xs">
                  {monthName}
                </div>

                {isToday && (
                  <div className="absolute bottom-2 border-1 border-primary text-foreground text-xs px-2 py-1 rounded-full font-medium">
                    TODAY
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="text-sm">
            Total weeks in {currentYear}: <strong>{totalWeeksInYear}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;