import { writable } from "svelte/store";

//COMPONENTS

//1. Promoting inclusive environment
import RelevanceOfIntentionality from "./skills components/skill 1/RelevanceOfIntentionality.svelte"
import BuildAwareness from "./skills components/skill 1/BuildAwareness.svelte"
import DriveInclusiveTeamMeetings from "./skills components/skill 1/DriveInclusiveTeamMeetings.svelte"

//2. Leading by purpose
import LeadFromFront from "./skills components/skill 2/LeadFromFront.svelte"
import EmpowerAndHoldAccountable from "./skills components/skill 2/EmpowerAndHoldAccountable.svelte"

//3. Dealing with Ambiguity
import CreatingAPositiveEmployeeExperience from "./skills components/skill 3/CreatingAPositiveEmployeeExperience.svelte"

//4. 
import PropelASenseOfPsychologicalSafety from "./skills components/skill 4/PropelASenseOfPsychologicalSafety.svelte"


//5.
import RedefiningEmployeeWellbeing from "./skills components/skill 5/RedefiningEmployeeWellbeing.svelte"


//6
import DrivingEngagementThroughOptimalUseOfTechnology from "./skills components/skill 6/DrivingEngagementThroughOptimalUseOfTechnology.svelte"
import IntroduceTools from "./skills components/skill 6/IntroduceTools.svelte"

// 7.
import MakeEmployeeEngagementAContinuousProcess from "./skills components/skill 7/MakeEmployeeEngagementAContinuousProcess.svelte"
import HowToCombatFOMOAndFOTO from "./skills components/skill 7/HowToCombatFOMOAndFOTO.svelte"

//8.
import ManageConflictProductively from "./skills components/skill 8/ManageConflictProductively.svelte"



export let content = writable([
    {
        id: 1,
        name: "Promoting inclusive environment",
        active: true,
        nameHTML: "Promoting <span>inclusive environment</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Amplifying inclusive behavior, leaders should ensure that team members working virtually understand, feel, contribute the same value, have the same opportunities, as others who are in-person. The Hybrid model preempts the need for team leads and managers to:",
        introBullets: [
            "Understand whether lack of daily proximity with colleagues impacts inclusive decision making and career progression",
            "Understand if hybrid environment would impact relationship building among tenured and new professionals",
            "Ascertain ways to overcome challenges, if any, faced by team members subject to point they are in their career and life"
        ],
        stats: [
            "For <span>36%</span> of professionals Trust means - Inclusive decision-making and fair processes",
            "<span>43%</span> of professionals believe that they are focused and productive working from office as compared to home",
            "Approx. <span>20%</span> of professionals feel that they are not able to maintain the same kind of rapport and relationship with their team members and leaders while working from home",
        ],
        recommendations: [
            {
                id: 1,
                name: "Understand and role model when to be <span>'more in-person'</span> and when to be <span>‘more virtual’</span>.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 2,
                name: "Create opportunities for employees to <span>engage with senior leadership</span> regardless of geographical locations.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 3,
                name: "<span>Design inclusive meetings:</span>Determine how team meetings could best work for everyone through feedback from all team members.",
                shortName: "Drive inclusive team meetings",
                component: DriveInclusiveTeamMeetings,
            },
            {
                id: 4,
                name: "Keep a <span>constant check</span> on professionals’ goals so as to provide them with project opportunities to demonstrate skills; equally mindful of remote workers and proactively gave rationale for deployments.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 5,
                name: "<span>Build awareness:</span> Re-iterate firm policies supporting hybrid work, inclusion practices to support dependent care, and flexibility options to address varied situations.",
                shortName: "Build awareness",
                component: BuildAwareness,
            },
            {
                id: 6,
                name: "<span>Relevance of intentionality:</span> Continue to share information in an online - only way first, so that no - one feels excluded.",
                shortName: "Relevance of intentionality",
                component: RelevanceOfIntentionality,
            },
        ]
    },
    {
        id: 2,
        name: "Leading by purpose",
        nameHTML: "Leading by <span>purpose</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Strong bonding, meaningful work connecting it back to the purpose will create greater engagement",
        introBullets: [
            "Feeling valued and belonging will play a crucial role creating a sense of ownership",
            "Neither technologies nor training nor other events can bring a team together like meaningful challenges people are inspired to tackle together.",
            "Managers must communicate why and how the purpose relates to every job and team throughout the organization.",
            "Establish how their groups' goals and tasks contribute to their bigger picture and the greater good."
        ],
        stats: [
            "For <span>40%</span> of professionals, Trust means - Transparent, timely, and consistent communication from senior leaders across US and USI",
            "Approx. <span>20%</span> of professionals feel that they are not able to maintain the same kind of rapport and relationship with their team members and leaders while working from home",
            "For <span>36%</span> of professionals Trust means - Inclusive decision-making, fair processes and providing equal opportunities",
            "Only <span>29%</span> of professionals feel that senior leaders’ actions match their words (‘walk the talk’)",
        ],
        recommendations: [
            {
                id: 1,
                name: "<span>Invest in the talent:</span> Create a workplace environment that centers on L&D programs fueling career development. Help professionals build skills-forte and empower them to reskill/upskill to positively impact career growth opportunities.",
                shortName: "Lead from front",
                component: LeadFromFront,
            },
            {
                id: 2,
                name: "<span>Empower and hold accountable:</span> Clearly outline milestones/objectives that the team/professional needs to achieve—and let them navigate the path to achieve those.",
                shortName: "Empower and hold accountable",
                component: EmpowerAndHoldAccountable,
            },
            {
                id: 3,
                name: "<span>Share goals to stay connected:</span> Identify and build collective aspirations that creates a sense of shared purpose and establishes connects with team members. With an objective to hold people together and allows them to coordinate their efforts and work together for mutual benefit.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 4,
                name: "<span>Create a fail-safe environment:</span> Encourage team members to experiment and innovate. De-stigmatize failure by sharing personal experiences and lessons learned, focusing on how mistakes may help improve future outcomes.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 5,
                name: "<span>Forge connections:</span> Assign cross-functional projects to teammates who otherwise wouldn’t work together, include ice-breakers and get-acquainted with others teams/team members.",
                shortName: undefined,
                component: undefined,
            },

        ]
    },
    {
        id: 3,
        name: "Dealing with ambiguity",
        nameHTML: "Dealing with <span>ambiguity</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Amplifying inclusive behavior, leaders should ensure that team members working virtually understand, feel, contribute the same value, have the same opportunities, as others who are in-person. The Hybrid model preempts the need for team leads and managers to,",
        introBullets: [
            "When leaders show empathy and adaptable skills and give their team members more opportunities to grow, passion and engagement follow. <br> - Hakimuddin Badshah",
        ],
        stats: [
            "<span>50%</span> of professionals prefer some in-person coach connects in a year",
            "<span>7%</span> of professionals feel that they are not being treated equally in the WFH situation",
            "<span>10%</span> of professionals feel that their performance and their teams are getting impacted if they work from home for long durations",
            "<span>27%</span> of professionals feel that the leaders should be clear about how they invest in professionals' success",
        ],
        recommendations: [
            {
                id: 1,
                name: "<span>Show confidence and conviction without retaliation:</span>",
                bullets: ["Create a <span>positive employee experience</span>: Focus on outcomes vs. tasks and approach.",
                    "<span>Empower professionals to evolve their skills</span> by offering training, guidance, and mentorship.",
                    "Plan for <span>different scenarios and seek guidance</span>: No one size fits all. Schedule connects based on different needs and situations in life.",
                    "Account for relevant parameters during performance evaluation and KPI planning to <span>remove any implicit biases</span>."],
                shortName: "Creating a positive employee experience",
                component: CreatingAPositiveEmployeeExperience,
                type: "bulleted list"
            },
            {
                id: 2,
                name: "<span>Encourage a speak-up culture</span>, where people can share concerns and raise questions without the fear of repercussion.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 3,
                name: "<span>Embrace change</span>: Feel confident about asking for additional information or details that can help analyze, interpret, and then communicate the expectations to the wider team.",
                shortName: undefined,
                component: undefined,
            },
        ]
    },
    {
        id: 4,
        name: "Building resilience (self & teams)",
        nameHTML: "Building <span>resilience</span> (self & teams)",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Propel a sense of psychological safety by engaging professionals to create a trusted and empathetic team culture in a hybrid work environment",
        introBullets: [
            "Understand the comfort level of professionals with their managers",
            "Ways to improve trust / empathy levels within the team",
            "Identify ways to create more engagement in a virtual environment",
            "Ascertain if equal and un- biased growth opportunities are available for the professionals",
        ],
        stats: [],
        recommendations: [
            {
                name: "Facilitate engaging <span>future-focused conversations</span> that allow employees to voice their opinions on exploring growth paths, new experiences, or needing support",
                shortName: "Propel a sense of psychological safety ",
                component: PropelASenseOfPsychologicalSafety,
            },
            {
                name: "Keep a track of any concerns, indicators that can help in <span>putting together an intervention</span>.",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "<span>Direct teams to firm resources</span> that enable employees to access resources, gather information, and even raise questions.",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "Feel empowered to <span>seek guidance or support</span> from leaders or Talent advisors to provide appropriate solutions to team members to address issues or concerns.",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "<span>Foster connection in new ways</span>: Ease connections with leadership to create informal opportunities for meaningful connection as well as emotional guidance.",
                shortName: undefined,
                component: undefined,
            },

        ]
    },
    {
        id: 5,
        name: "Balancing personal and business needs",
        nameHTML: "Balancing <span>personal and business needs</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "",
        introBullets: [
            "Due to the “always-on” access to work that hybrid provides, some employees report higher levels of exhaustion due to a lack of control over their schedules and emphasize the need for work-life balance",
            "The new way of working requires team leads to think fast and act quicker to develop successful hybrid working models, as well as implementing wellbeing and development programs to ensure their team members are supported with the right tools to enrich work environment.",
            "Ensuring you take the time to understand what your employees need and finding ways to support their success is foundational to building a strong organization and a vibrant team."
        ],
        stats: [
            "<span>30%</span> of professionals feel stressed due to anxiety of unknown",
        ],
        recommendations: [
            {
                name: "Understand that <span>needs of each individual is different</span> and may vary as we get used to hybrid work model. Empower your team members with flexibility in how they plan and deliver the expectations.",
                shortName: "Redefining employee wellbeing…",
                component: RedefiningEmployeeWellbeing,
            },
            {
                name: "Encourage professionals to have a <span>‘back- up’ plan at home</span> to tackle domestic needs (e.g., parental and childcare).",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "Create a <span>high-trust environment</span> by understanding and addressing re-entry anxiety. Have <span>frequent check-ins</span> (on a need basis) to listen, empathize, and work together on concerns.",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "Conduct <span>periodic pulse checks</span> to gauge team members’ engagement levels and mental well-being.",
                shortName: undefined,
                component: undefined,
            },
            {
                name: "<span>Lead by example</span>: Best way to encourage team to take care of themselves is by following yourself. Establish well-being guidelines and commitments, such as- taking periodic time-offs, blocking calendars for wellness breaks, promoting good workplace ergonomics, etc.",
                shortName: undefined,
                component: undefined,
            },
        ]
    },
    {
        id: 6,
        name: "Driving engagement through optimal use of technology",
        nameHTML: "Driving engagement through <span>optimal use of technology</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Technologies you need to consider during hybrid…",
        introBullets: [
            "Collaboration tools – Have separate tools for each situation",
            "Track progress on common projects, independent of physical location",
            "File-sharing tools",
            "Communication and Instant messaging",
            "Online whiteboards",
            "Well-being activities and informal connects",
            "Videos calls and brain storming sessions"
        ],
        stats: [
            "<span>42%</span> of professionals feel that multiple tools that give conflicting data is delaying the work and creating redundant efforts",
            "<span>37%</span> of professionals say that there is a lack of visibility into the availability, performance, and usage of resources",
            "<span>35%</span> of professionals feel that there is too much data and not enough context or actionable insight",
            "<span>34%</span> of professionals feel that there is a lack of unified visibility across the entire technology infrastructure",
            "<span>33%</span> of professionals say that data is not accessible or usable by all who need it",
        ],
        recommendations: [

            {
                id: 1,
                name: "<span>Designate a meeting project manager</span> (preferably an in person team member) to manage agenda and capture minutes so that you can focus on effective meetings.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 2,
                name: "Carve out time for remote workers to <span>connect with in-person participants</span> — add ice-breakers and energizers at the beginning of meeting/ sessions.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 3,
                name: "<span>Reduce number of calls that professionals need to attend by:</span>",
                bullets: [
                    "Recording calls whenever possible",
                    "Empowering professionals to choose calls as per priority "
                ],
                shortName: undefined,
                component: undefined,
                type: "bulleted list"
            },
            {
                id: 4,
                name: "<span>Leverage the right technology platform</span> depending on the purpose of meetings/calls (more Audio/Video for human connect, whiteboarding to capture ideas)",
                shortName: "Driving engagement through optimal use of technology: Additional resources",
                component: DrivingEngagementThroughOptimalUseOfTechnology,
            },
            {
                id: 5,
                name: "Get inputs from team members before <span>introducing a new tool or deciding for a specific tool</span>. Establish a feedback process to raise queries or concerns.",
                shortName: "Introduce tools",
                component: IntroduceTools,
            },
            {
                id: 6,
                name: "<span>Give everyone a voice</span>: Aim for balanced input from in-person and remote participants. Provide opportunity for everyone to contribute.",
                shortName: undefined,
                component: undefined,
            },

        ]
    },
    {
        id: 7,
        name: "Motivating for sustained engagement",
        nameHTML: "Motivating for <span>sustained engagement</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "High <span>belonging</span> increases job performance by 56%, and reduces employee turnover risk by 50%",
        introBullets: [
            "Allow personalization to motivate employees to thrive at work and home while having the freedom to create their own work strategies.",
            "Help them craft more human and purpose - driven goals and remind them that they’re a part of the bigger picture regardless of their physical visibility"
        ],
        stats: [
            "<span>64%</span> of professionals feel that people in the organization share information and knowledge across divisions / departments / functions.",
            "<span>29%</span> of professionals are confident that they can make their future work - life fit work for them at Deloitte",
            "<span>50%</span> of professionals feel that unavailability of time due to workload as the biggest barrier in creating a culture of innovation",
        ],
        recommendations: [
            {
                id: 1,
                name: "<span>Make it personal</span>: Every team members is going to have a different experience working in hybrid. Every situation needs to be taken into consideration before reaching any conclusion.",
                shortName: "Make employee engagement a continuous process",
                component: MakeEmployeeEngagementAContinuousProcess,
            },
            {
                id: 2,
                name: "<span>Celebrate small wins and appreciate contributions</span>: Encourage team members’ ‘motivation levels’. Share their small and big wins, give them the spotlight. Align contributions to the overall greater objective of the BA.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 3,
                name: "<span>Make the invisible visible</span>: Leverage opportunities to build bridges, create connections among team members, and ensure everyone receives due exposure and recognition, regardless of geographical location.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 4,
                name: "<span>Fear of Missing out</span>: Managers need to have regular connects with team members to identify and manage the Fear of Missing Out (FOMO), so that it doesn’t bear any negative impact on professional engagement or demotivate them.",
                shortName: "How to combat FOMO and FOTO",
                component: HowToCombatFOMOAndFOTO,
            },
            {
                id: 5,
                name: "<span>Offer meaningful recognition</span>:  Rewards and recognition play a direct role in influencing a professional’s engagement and motivate them.",
                shortName: undefined,
                component: undefined,
            },

        ]
    },
    {
        id: 8,
        name: "Building awareness towards cultural nuances",
        nameHTML: "Building awareness towards <span>cultural nuances</span>",
        description: "Create an open and inclusive culture which enables the team members to feel confident, secure, and motivated.",
        introText: "Culture is critically important to company success and hence the growing focus on culture and the need to create, foster and nurture culture when people are working in multiple places. The complex and sensitive responsibility to create constructive cultures will be made even more complicated by people working from everywhere.",
        introBullets: [],
        stats: [],
        recommendations: [
            {
                id: 1,
                name: "<span>Create real and perceived proximity</span>: Connect with peers and leaders in-person or by virtual mode to foster better collaboration.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 2,
                name: "<span>Constructive culture</span>: Create, foster, and nurture culture when people are working in multiple locations, especially among new hires. Keep a tab on complex and sensitive issues arising within groups and provide appropriate direction.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 3,
                name: "<span>Manage conflict productively</span>: In hybrid work environment, leaders and team members need to be attuned to potential differences  and reinforce the need for healthy disagreement.",
                shortName: "Manage conflict productively",
                component: ManageConflictProductively,
            },
            {
                id: 4,
                name: "<span>Leverage L&D resources</span>: Educate teams on leveraging existing L&D resources on handling biases and cultural differences.",
                shortName: undefined,
                component: undefined,
            },
            {
                id: 5,
                name: "<span>Sensitization around biases</span>: Enable discussions that remove any animosity towards a particular ‘outgroup’ entity.",
                shortName: undefined,
                component: undefined,
            },

        ]
    },
])

