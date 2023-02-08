import Header from '../components/head';
import NavBar from '../components/navbar';

const NotePage = () => {

    // generate
    return (
        <>
            <Header title="On Call" description="A tool for doctors who are on call and taking referrals"/>
            <main className="flex h-[calc(100vh)] w-[100vw] items-center flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-[0.7rem] sm:text-[0.9rem] overflow-auto">
                <div className = "flex flex-col px-4 w-full overflow-auto h-full sm:max-w-screen-xl !w-[calc(100vw-20px)]">
                    <div className="flex h-full flex-row py-2">
                        <h1 className="flex text-[1.5rem] h-max w-full font-extrabold tracking-tight text-white py-2 pl-2 sm:text-[2rem]">
                            On <span className="text-[hsl(280,100%,70%)]">Call</span>
                        </h1>
                    </div>
                </div>
            </main>
            <NavBar navList="" page="other" />
        </>
    )
}

export default NotePage
