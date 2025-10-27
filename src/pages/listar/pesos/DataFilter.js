import DateTimePicker from '@react-native-community/datetimepicker';

const DataFilter = ({ setDia, setMes, setAno, dia, mes, ano, show, setShow }) => {

    const onChange = (event, selectedDate) => {
        if (event.type == 'dismissed') {
            return setShow(false);
        }
        setShow(false);
        const currentDate = selectedDate;
        setDia(String(currentDate.getDate()).padStart(2, '0'));
        setMes(String(currentDate.getMonth() + 1).padStart(2, '0'));
        setAno(currentDate.getFullYear());
    };

    return (
        show &&
        <DateTimePicker
            value={new Date(`${ano}-${mes}-${dia}T17:51:56.711Z`)}
            mode='date'
            onChange={onChange}
        />
    );
};
export default DataFilter;