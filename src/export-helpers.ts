import { type Card } from './database.config';
import { jsPDF } from "jspdf";

export const exportPdf = (
    cards: Array<Card>
) => {
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" })

    // diable any rule as splitTextToSize returns an any type.... eugh
    const result = cards.map((c: Card) => {
        return {
            urn: c.urn ? doc.splitTextToSize(c.urn, 20) : " ", // eslint-disable-line
            name: c.name ? doc.splitTextToSize(c.name, 60) : " ", // eslint-disable-line
            dob: c.dob ? new Date(c.dob).toDateString() : " ",
            summary: c.summary ? doc.splitTextToSize(c.summary, 60) : " ", // eslint-disable-line
            content: c.content ? doc.splitTextToSize(c.content, 120) : " " // eslint-disable-line
        }
    })

    const headers = [
        "urn",
        "name",
        "dob",
        "summary",
        "content"
    ]

    doc.table(10, 10, result, headers, {autoSize: false})
    doc.output('dataurlnewwindow')
}

export const exportCsv = (
    cards: Array<Card>
) => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "urn,name,dob,summary,content\n"
        + cards.map(
            c => `${c.urn ? c.urn.trim() : ""},${c.name ? c.name.trim() : ""},${c.dob ? new Date(c.dob).toDateString() : ""},${c.summary ? c.summary.trim() : ""},${c.content.trim()}`
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}
