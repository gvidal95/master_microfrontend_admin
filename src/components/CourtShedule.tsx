type CourtSheduleProps = {
    courtId: number;
};

export const CourtShedule = (props: CourtSheduleProps) => {
    return "Componente de Gestión Horarios de una cancha " + props.courtId
}